module aptos_dex::trading_pair {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_dex::token_factory;

    /// 错误码
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_PAIR_ALREADY_EXISTS: u64 = 2;
    const E_INSUFFICIENT_DEPOSIT: u64 = 3;
    const E_INVALID_FEE_RATE: u64 = 4;
    const E_INVALID_MIN_AMOUNT: u64 = 5;
    const E_PAIR_NOT_EXISTS: u64 = 6;
    const E_INSUFFICIENT_BALANCE: u64 = 7;
    const E_INVALID_TOKEN: u64 = 8;
    const E_STREET_NOT_ASSOCIATED: u64 = 9;

    /// 最小USDT保证金 (1000 USDT with 6 decimals)
    const MIN_USDT_DEPOSIT: u64 = 1000000000;
    
    /// 最大手续费率 (10% = 1000 basis points)
    const MAX_FEE_RATE: u64 = 1000;

    /// 交易对信息
    struct PairInfo has key, store {
        token_a: address,           // 用户代币地址
        token_b: address,           // USDT地址
        fee_rate: u64,              // 手续费率 (basis points, 100 = 1%)
        min_trade_amount: u64,      // 最小交易金额
        creator: address,           // 创建者
        usdt_deposit: u64,          // USDT保证金
        created_at: u64,            // 创建时间
        is_active: bool,            // 是否激活
        street_address: address,    // 关联的商业街地址
    }

    /// 交易对注册表
    struct PairRegistry has key {
        pairs: vector<address>,     // 所有交易对地址
        user_pairs: vector<address>, // 用户创建的交易对
    }

    /// 流动性池
    struct LiquidityPool has key {
        token_a_reserve: u64,       // 代币A储备
        token_b_reserve: u64,       // 代币B储备 (USDT)
        total_liquidity: u64,       // 总流动性
        creator_liquidity: u64,     // 创建者流动性份额
    }

    /// 交易对创建事件
    #[event]
    struct PairCreatedEvent has drop, store {
        pair_address: address,
        token_a: address,
        token_b: address,
        fee_rate: u64,
        min_trade_amount: u64,
        creator: address,
        usdt_deposit: u64,
        street_address: address, // 新增：关联的商业街地址
        created_at: u64,
    }

    /// 交易事件
    #[event]
    struct TradeEvent has drop, store {
        pair_address: address,
        trader: address,
        token_in: address,
        token_out: address,
        amount_in: u64,
        amount_out: u64,
        fee_amount: u64,
        timestamp: u64,
    }

    /// 流动性添加事件
    #[event]
    struct LiquidityAddedEvent has drop, store {
        pair_address: address,
        provider: address,
        token_a_amount: u64,
        token_b_amount: u64,
        liquidity_minted: u64,
        timestamp: u64,
    }

    /// 初始化模块
    fun init_module(admin: &signer) {
        move_to(admin, PairRegistry {
            pairs: vector::empty(),
            user_pairs: vector::empty(),
        });
    }

    /// 创建交易对
    public entry fun create_pair<TokenA, USDT>(
        creator: &signer,
        token_a_address: address,
        usdt_address: address,
        fee_rate: u64,
        min_trade_amount: u64,
        usdt_deposit_amount: u64,
        street_address: address, // 新增：关联的商业街地址
    ) acquires PairRegistry {
        let creator_addr = signer::address_of(creator);
        
        // 验证参数
        assert!(usdt_deposit_amount >= MIN_USDT_DEPOSIT, E_INSUFFICIENT_DEPOSIT);
        assert!(fee_rate <= MAX_FEE_RATE, E_INVALID_FEE_RATE);
        assert!(min_trade_amount > 0, E_INVALID_MIN_AMOUNT);
        assert!(token_factory::token_exists(token_a_address), E_INVALID_TOKEN);
        // Note: Street existence validation should be done at the caller level
        // to avoid circular dependency between trading_pair and commercial_street modules

        // 检查USDT余额
        let usdt_balance = coin::balance<USDT>(creator_addr);
        assert!(usdt_balance >= usdt_deposit_amount, E_INSUFFICIENT_BALANCE);

        // 转移USDT保证金到合约
        let usdt_coins = coin::withdraw<USDT>(creator, usdt_deposit_amount);
        
        // 创建交易对信息
        let pair_info = PairInfo {
            token_a: token_a_address,
            token_b: usdt_address,
            fee_rate,
            min_trade_amount,
            creator: creator_addr,
            usdt_deposit: usdt_deposit_amount,
            created_at: timestamp::now_seconds(),
            is_active: true,
            street_address, // 新增：关联的商业街地址
        };

        // 创建流动性池
        let liquidity_pool = LiquidityPool {
            token_a_reserve: 0,
            token_b_reserve: usdt_deposit_amount,
            total_liquidity: usdt_deposit_amount,
            creator_liquidity: usdt_deposit_amount,
        };

        // 存储到创建者账户
        move_to(creator, pair_info);
        move_to(creator, liquidity_pool);

        // 存储USDT到合约账户
        coin::deposit(creator_addr, usdt_coins);

        // 更新注册表
        let registry = borrow_global_mut<PairRegistry>(@aptos_dex);
        vector::push_back(&mut registry.pairs, creator_addr);
        vector::push_back(&mut registry.user_pairs, creator_addr);

        // 发出事件
        event::emit(PairCreatedEvent {
            pair_address: creator_addr,
            token_a: token_a_address,
            token_b: usdt_address,
            fee_rate,
            min_trade_amount,
            creator: creator_addr,
            usdt_deposit: usdt_deposit_amount,
            street_address, // 新增：关联的商业街地址
            created_at: timestamp::now_seconds(),
        });
    }

    /// 执行交易
    public entry fun swap<TokenA, USDT>(
        trader: &signer,
        pair_address: address,
        token_in_address: address,
        amount_in: u64,
        min_amount_out: u64,
    ) acquires PairInfo, LiquidityPool {
        let trader_addr = signer::address_of(trader);
        
        // 获取交易对信息
        assert!(exists<PairInfo>(pair_address), E_PAIR_NOT_EXISTS);
        let pair_info = borrow_global<PairInfo>(pair_address);
        assert!(pair_info.is_active, E_PAIR_NOT_EXISTS);
        assert!(amount_in >= pair_info.min_trade_amount, E_INVALID_MIN_AMOUNT);

        // 获取流动性池
        let pool = borrow_global_mut<LiquidityPool>(pair_address);
        
        let (amount_out, fee_amount) = if (token_in_address == pair_info.token_a) {
            // TokenA -> USDT
            let token_a_coins = coin::withdraw<TokenA>(trader, amount_in);
            let amount_out = calculate_output_amount(
                amount_in,
                pool.token_a_reserve,
                pool.token_b_reserve,
                pair_info.fee_rate
            );
            assert!(amount_out >= min_amount_out, E_INSUFFICIENT_BALANCE);
            
            // 更新储备
            pool.token_a_reserve = pool.token_a_reserve + amount_in;
            pool.token_b_reserve = pool.token_b_reserve - amount_out;
            
            // 转移代币
            coin::deposit(pair_address, token_a_coins);
            let usdt_coins = coin::withdraw<USDT>(trader, amount_out);
            coin::deposit(trader_addr, usdt_coins);
            
            (amount_out, (amount_in * pair_info.fee_rate) / 10000)
        } else {
            // USDT -> TokenA
            let usdt_coins = coin::withdraw<USDT>(trader, amount_in);
            let amount_out = calculate_output_amount(
                amount_in,
                pool.token_b_reserve,
                pool.token_a_reserve,
                pair_info.fee_rate
            );
            assert!(amount_out >= min_amount_out, E_INSUFFICIENT_BALANCE);
            
            // 更新储备
            pool.token_b_reserve = pool.token_b_reserve + amount_in;
            pool.token_a_reserve = pool.token_a_reserve - amount_out;
            
            // 转移代币
            coin::deposit(pair_address, usdt_coins);
            let token_a_coins = coin::withdraw<TokenA>(trader, amount_out);
            coin::deposit(trader_addr, token_a_coins);
            
            (amount_out, (amount_in * pair_info.fee_rate) / 10000)
        };

        // 发出交易事件
        event::emit(TradeEvent {
            pair_address,
            trader: trader_addr,
            token_in: token_in_address,
            token_out: if (token_in_address == pair_info.token_a) pair_info.token_b else pair_info.token_a,
            amount_in,
            amount_out,
            fee_amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// 计算输出金额 (AMM公式: x * y = k)
    fun calculate_output_amount(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64,
        fee_rate: u64,
    ): u64 {
        let amount_in_with_fee = amount_in * (10000 - fee_rate);
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = (reserve_in * 10000) + amount_in_with_fee;
        numerator / denominator
    }

    /// Get trading pair information
    #[view]
    public fun get_pair_info(pair_address: address): (address, address, u64, u64, address, u64, u64, bool, address) acquires PairInfo {
        assert!(exists<PairInfo>(pair_address), E_PAIR_NOT_EXISTS);
        let pair_info = borrow_global<PairInfo>(pair_address);
        (
            pair_info.token_a,
            pair_info.token_b,
            pair_info.fee_rate,
            pair_info.min_trade_amount,
            pair_info.creator,
            pair_info.usdt_deposit,
            pair_info.created_at,
            pair_info.is_active,
            pair_info.street_address // 新增：关联的商业街地址
        )
    }

    /// Get liquidity pool information
    #[view]
    public fun get_pool_info(pair_address: address): (u64, u64, u64, u64) acquires LiquidityPool {
        let pool = borrow_global<LiquidityPool>(pair_address);
        (
            pool.token_a_reserve,
            pool.token_b_reserve,
            pool.total_liquidity,
            pool.creator_liquidity
        )
    }

    /// Get all trading pairs
    #[view]
    public fun get_all_pairs(): vector<address> acquires PairRegistry {
        let registry = borrow_global<PairRegistry>(@aptos_dex);
        registry.pairs
    }

    /// Get user created trading pairs
    #[view]
    public fun get_user_pairs(user: address): vector<address> acquires PairRegistry, PairInfo {
        let registry = borrow_global<PairRegistry>(@aptos_dex);
        let user_pairs = vector::empty<address>();
        let i = 0;
        let len = vector::length(&registry.pairs);
        
        while (i < len) {
            let pair_addr = *vector::borrow(&registry.pairs, i);
            if (exists<PairInfo>(pair_addr)) {
                let pair_info = borrow_global<PairInfo>(pair_addr);
                if (pair_info.creator == user) {
                    vector::push_back(&mut user_pairs, pair_addr);
                };
            };
            i = i + 1;
        };
        
        user_pairs
    }

    /// Check if trading pair exists
    #[view]
    public fun pair_exists(pair_address: address): bool {
        exists<PairInfo>(pair_address)
    }

    /// Get commercial street address associated with trading pair
    #[view]
    public fun get_pair_street(pair_address: address): address acquires PairInfo {
        assert!(exists<PairInfo>(pair_address), E_PAIR_NOT_EXISTS);
        let pair_info = borrow_global<PairInfo>(pair_address);
        pair_info.street_address
    }

    #[test_only]
    use std::vector;

    #[test(admin = @aptos_dex, creator = @0x123)]
    public fun test_create_pair(admin: &signer, creator: &signer) acquires PairRegistry {
        init_module(admin);
        // 测试代码...
    }
}
