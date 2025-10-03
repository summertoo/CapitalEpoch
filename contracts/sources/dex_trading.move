module aptos_dex::dex_trading {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};
    use aptos_std::type_info;

    // 错误码
    const E_NOT_INITIALIZED: u64 = 1;
    const E_PAIR_NOT_EXISTS: u64 = 2;
    const E_INSUFFICIENT_LIQUIDITY: u64 = 3;
    const E_INSUFFICIENT_INPUT_AMOUNT: u64 = 4;
    const E_INSUFFICIENT_OUTPUT_AMOUNT: u64 = 5;
    const E_SLIPPAGE_TOO_HIGH: u64 = 6;
    const E_BELOW_MIN_TRADE_AMOUNT: u64 = 7;
    const E_UNAUTHORIZED: u64 = 8;

    // 交易对信息
    struct TradingPairInfo has key, store {
        token_a_reserve: u64,
        token_b_reserve: u64,
        fee_rate: u64, // 手续费率，以基点为单位 (1% = 100)
        min_trade_amount: u64,
        creator: address,
        total_volume: u64,
        fee_collected: u64,
    }

    // 全局交易所状态
    struct DEXState has key {
        pairs: Table<String, TradingPairInfo>,
        platform_fee_rate: u64, // 平台手续费率
        platform_fee_collected: u64,
        admin: address,
    }

    // 交易事件
    struct TradeEvent has drop, store {
        user: address,
        pair_id: String,
        token_in: String,
        token_out: String,
        amount_in: u64,
        amount_out: u64,
        fee_amount: u64,
        timestamp: u64,
    }

    // 流动性事件
    struct LiquidityEvent has drop, store {
        user: address,
        pair_id: String,
        token_a_amount: u64,
        token_b_amount: u64,
        is_add: bool,
        timestamp: u64,
    }

    // 事件句柄
    struct EventHandles has key {
        trade_events: EventHandle<TradeEvent>,
        liquidity_events: EventHandle<LiquidityEvent>,
    }

    // 初始化DEX
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, DEXState {
            pairs: table::new(),
            platform_fee_rate: 30, // 0.3% 平台手续费
            platform_fee_collected: 0,
            admin: admin_addr,
        });

        move_to(admin, EventHandles {
            trade_events: account::new_event_handle<TradeEvent>(admin),
            liquidity_events: account::new_event_handle<LiquidityEvent>(admin),
        });
    }

    // 创建交易对
    public entry fun create_pair<TokenA, TokenB>(
        creator: &signer,
        initial_a: u64,
        initial_b: u64,
        fee_rate: u64,
        min_trade_amount: u64
    ) acquires DEXState {
        let creator_addr = signer::address_of(creator);
        let dex_state = borrow_global_mut<DEXState>(@aptos_dex);
        
        let pair_id = generate_pair_id<TokenA, TokenB>();
        
        let pair_info = TradingPairInfo {
            token_a_reserve: initial_a,
            token_b_reserve: initial_b,
            fee_rate,
            min_trade_amount,
            creator: creator_addr,
            total_volume: 0,
            fee_collected: 0,
        };
        
        table::add(&mut dex_state.pairs, pair_id, pair_info);
    }

    // USDT换代币 (用户提供USDT，获得代币)
    public entry fun swap_usdt_for_token<Token>(
        user: &signer,
        usdt_amount: u64,
        min_token_out: u64
    ) acquires DEXState, EventHandles {
        let user_addr = signer::address_of(user);
        let dex_state = borrow_global_mut<DEXState>(@aptos_dex);
        
        let pair_id = generate_pair_id<coin::Coin<Token>, coin::Coin<Token>>(); // 简化处理
        assert!(table::contains(&dex_state.pairs, pair_id), E_PAIR_NOT_EXISTS);
        
        let pair_info = table::borrow_mut(&mut dex_state.pairs, pair_id);
        assert!(usdt_amount >= pair_info.min_trade_amount, E_BELOW_MIN_TRADE_AMOUNT);
        
        // 计算输出代币数量 (AMM公式: x * y = k)
        let fee_amount = (usdt_amount * pair_info.fee_rate) / 10000;
        let platform_fee = (fee_amount * dex_state.platform_fee_rate) / 100;
        let usdt_after_fee = usdt_amount - fee_amount;
        
        let token_out = calculate_output_amount(
            usdt_after_fee,
            pair_info.token_b_reserve, // USDT储备
            pair_info.token_a_reserve  // 代币储备
        );
        
        assert!(token_out >= min_token_out, E_SLIPPAGE_TOO_HIGH);
        assert!(token_out < pair_info.token_a_reserve, E_INSUFFICIENT_LIQUIDITY);
        
        // 更新储备
        pair_info.token_b_reserve = pair_info.token_b_reserve + usdt_after_fee;
        pair_info.token_a_reserve = pair_info.token_a_reserve - token_out;
        pair_info.total_volume = pair_info.total_volume + usdt_amount;
        pair_info.fee_collected = pair_info.fee_collected + (fee_amount - platform_fee);
        
        // 更新平台手续费
        dex_state.platform_fee_collected = dex_state.platform_fee_collected + platform_fee;
        
        // 发出交易事件
        let event_handles = borrow_global_mut<EventHandles>(@aptos_dex);
        event::emit_event(&mut event_handles.trade_events, TradeEvent {
            user: user_addr,
            pair_id,
            token_in: string::utf8(b"USDT"),
            token_out: type_info::type_name<Token>(),
            amount_in: usdt_amount,
            amount_out: token_out,
            fee_amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    // 代币换USDT (用户提供代币，获得USDT)
    public entry fun swap_token_for_usdt<Token>(
        user: &signer,
        token_amount: u64,
        min_usdt_out: u64
    ) acquires DEXState, EventHandles {
        let user_addr = signer::address_of(user);
        let dex_state = borrow_global_mut<DEXState>(@aptos_dex);
        
        let pair_id = generate_pair_id<coin::Coin<Token>, coin::Coin<Token>>(); // 简化处理
        assert!(table::contains(&dex_state.pairs, pair_id), E_PAIR_NOT_EXISTS);
        
        let pair_info = table::borrow_mut(&mut dex_state.pairs, pair_id);
        
        // 计算输出USDT数量
        let usdt_out = calculate_output_amount(
            token_amount,
            pair_info.token_a_reserve, // 代币储备
            pair_info.token_b_reserve  // USDT储备
        );
        
        let fee_amount = (usdt_out * pair_info.fee_rate) / 10000;
        let platform_fee = (fee_amount * dex_state.platform_fee_rate) / 100;
        let usdt_after_fee = usdt_out - fee_amount;
        
        assert!(usdt_after_fee >= min_usdt_out, E_SLIPPAGE_TOO_HIGH);
        assert!(usdt_out < pair_info.token_b_reserve, E_INSUFFICIENT_LIQUIDITY);
        
        // 更新储备
        pair_info.token_a_reserve = pair_info.token_a_reserve + token_amount;
        pair_info.token_b_reserve = pair_info.token_b_reserve - usdt_out;
        pair_info.total_volume = pair_info.total_volume + usdt_out;
        pair_info.fee_collected = pair_info.fee_collected + (fee_amount - platform_fee);
        
        // 更新平台手续费
        dex_state.platform_fee_collected = dex_state.platform_fee_collected + platform_fee;
        
        // 发出交易事件
        let event_handles = borrow_global_mut<EventHandles>(@aptos_dex);
        event::emit_event(&mut event_handles.trade_events, TradeEvent {
            user: user_addr,
            pair_id,
            token_in: type_info::type_name<Token>(),
            token_out: string::utf8(b"USDT"),
            amount_in: token_amount,
            amount_out: usdt_after_fee,
            fee_amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    // 添加流动性
    public entry fun add_liquidity<TokenA, TokenB>(
        user: &signer,
        token_a_amount: u64,
        token_b_amount: u64
    ) acquires DEXState, EventHandles {
        let user_addr = signer::address_of(user);
        let dex_state = borrow_global_mut<DEXState>(@aptos_dex);
        
        let pair_id = generate_pair_id<TokenA, TokenB>();
        assert!(table::contains(&dex_state.pairs, pair_id), E_PAIR_NOT_EXISTS);
        
        let pair_info = table::borrow_mut(&mut dex_state.pairs, pair_id);
        
        // 更新流动性储备
        pair_info.token_a_reserve = pair_info.token_a_reserve + token_a_amount;
        pair_info.token_b_reserve = pair_info.token_b_reserve + token_b_amount;
        
        // 发出流动性事件
        let event_handles = borrow_global_mut<EventHandles>(@aptos_dex);
        event::emit_event(&mut event_handles.liquidity_events, LiquidityEvent {
            user: user_addr,
            pair_id,
            token_a_amount,
            token_b_amount,
            is_add: true,
            timestamp: timestamp::now_seconds(),
        });
    }

    // 计算输出数量 (AMM公式)
    fun calculate_output_amount(input_amount: u64, input_reserve: u64, output_reserve: u64): u64 {
        let numerator = input_amount * output_reserve;
        let denominator = input_reserve + input_amount;
        numerator / denominator
    }

    // 生成交易对ID
    fun generate_pair_id<TokenA, TokenB>(): String {
        let type_a = type_info::type_name<TokenA>();
        let type_b = type_info::type_name<TokenB>();
        
        // 简单拼接类型名称作为ID
        let mut pair_id = type_a;
        string::append(&mut pair_id, string::utf8(b"-"));
        string::append(&mut pair_id, type_b);
        pair_id
    }

    // 查询交易对信息
    #[view]
    public fun get_pair_info(pair_id: String): (u64, u64, u64, u64, address, u64, u64) acquires DEXState {
        let dex_state = borrow_global<DEXState>(@aptos_dex);
        assert!(table::contains(&dex_state.pairs, pair_id), E_PAIR_NOT_EXISTS);
        
        let pair_info = table::borrow(&dex_state.pairs, pair_id);
        (
            pair_info.token_a_reserve,
            pair_info.token_b_reserve,
            pair_info.fee_rate,
            pair_info.min_trade_amount,
            pair_info.creator,
            pair_info.total_volume,
            pair_info.fee_collected
        )
    }

    // 计算交换预览
    #[view]
    public fun get_swap_preview(pair_id: String, input_amount: u64, is_usdt_to_token: bool): (u64, u64) acquires DEXState {
        let dex_state = borrow_global<DEXState>(@aptos_dex);
        assert!(table::contains(&dex_state.pairs, pair_id), E_PAIR_NOT_EXISTS);
        
        let pair_info = table::borrow(&dex_state.pairs, pair_id);
        
        let (input_reserve, output_reserve) = if (is_usdt_to_token) {
            (pair_info.token_b_reserve, pair_info.token_a_reserve)
        } else {
            (pair_info.token_a_reserve, pair_info.token_b_reserve)
        };
        
        let output_amount = calculate_output_amount(input_amount, input_reserve, output_reserve);
        let fee_amount = (output_amount * pair_info.fee_rate) / 10000;
        let final_output = output_amount - fee_amount;
        
        (final_output, fee_amount)
    }

    // 提取平台手续费 (仅管理员)
    public entry fun withdraw_platform_fees(admin: &signer) acquires DEXState {
        let admin_addr = signer::address_of(admin);
        let dex_state = borrow_global_mut<DEXState>(@aptos_dex);
        assert!(admin_addr == dex_state.admin, E_UNAUTHORIZED);
        
        // 这里应该实际转移代币，简化处理
        dex_state.platform_fee_collected = 0;
    }

    // 提取交易对手续费 (仅创建者)
    public entry fun withdraw_pair_fees(creator: &signer, pair_id: String) acquires DEXState {
        let creator_addr = signer::address_of(creator);
        let dex_state = borrow_global_mut<DEXState>(@aptos_dex);
        
        assert!(table::contains(&dex_state.pairs, pair_id), E_PAIR_NOT_EXISTS);
        let pair_info = table::borrow_mut(&mut dex_state.pairs, pair_id);
        assert!(creator_addr == pair_info.creator, E_UNAUTHORIZED);
        
        // 这里应该实际转移代币，简化处理
        pair_info.fee_collected = 0;
    }
}