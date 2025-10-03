#[test_only]
module aptos_dex::trading_pair_test {
    use std::signer;
    use aptos_dex::trading_pair;
    use aptos_dex::token_factory;
    use aptos_dex::usdt_mock;
    use aptos_framework::coin;

    #[test(admin = @0x1, creator = @0x2, trader = @0x3)]
    public fun test_pair_lifecycle(admin: &signer, creator: &signer, trader: &signer) {
        // 初始化模块
        token_factory::init_module(admin);
        trading_pair::init_module(admin);
        usdt_mock::initialize_usdt(admin);
        
        // 为创建者和交易者注册USDT
        usdt_mock::register_usdt(creator);
        usdt_mock::register_usdt(trader);
        
        // 为创建者铸造一些USDT用于保证金
        let usdt_deposit = 1000000000; // 1000 USDT
        usdt_mock::mint_usdt(admin, signer::address_of(creator), usdt_deposit * 2);
        
        // 创建代币
        token_factory::create_token(
            creator,
            b"Test Token",
            b"TEST",
            8,
            1000000,
            true
        );
        
        // 创建交易对
        let creator_addr = signer::address_of(creator);
        let fee_rate = 30; // 0.3%
        let min_trade_amount = 1000000; // 1 USDT
        
        trading_pair::create_pair<token_factory::TokenInfo, usdt_mock::USDT>(
            creator,
            creator_addr, // token_a_address
            signer::address_of(admin), // usdt_address (使用admin地址作为USDT地址)
            fee_rate,
            min_trade_amount,
            usdt_deposit
        );

        // 验证交易对是否存在
        assert!(trading_pair::get_all_pairs() != vector::empty<address>(), 1);
        
        // 验证交易对信息
        let (token_a, token_b, pair_fee_rate, pair_min_amount, pair_creator, pair_deposit, _, is_active) = 
            trading_pair::get_pair_info(creator_addr);
        
        assert!(token_a == creator_addr, 2);
        assert!(pair_fee_rate == fee_rate, 3);
        assert!(pair_min_amount == min_trade_amount, 4);
        assert!(pair_creator == creator_addr, 5);
        assert!(pair_deposit == usdt_deposit, 6);
        assert!(is_active, 7);
        
        // 验证流动性池信息
        let (reserve_a, reserve_b, total_liquidity, creator_liquidity) = 
            trading_pair::get_pool_info(creator_addr);
        
        assert!(reserve_a == 0, 8); // 初始时代币A储备为0
        assert!(reserve_b == usdt_deposit, 9); // USDT储备等于保证金
        assert!(total_liquidity == usdt_deposit, 10);
        assert!(creator_liquidity == usdt_deposit, 11);
    }

    #[test(admin = @0x1, creator = @0x2)]
    public fun test_invalid_deposit(admin: &signer, creator: &signer) {
        // 初始化模块
        token_factory::init_module(admin);
        trading_pair::init_module(admin);
        usdt_mock::initialize_usdt(admin);
        
        // 为创建者注册USDT
        usdt_mock::register_usdt(creator);
        
        // 创建代币
        token_factory::create_token(
            creator,
            b"Test Token",
            b"TEST",
            8,
            1000000,
            true
        );
        
        // 尝试创建保证金不足的交易对，应该失败
        let creator_addr = signer::address_of(creator);
        let insufficient_deposit = 100000000; // 100 USDT，小于最小要求1000 USDT
        
        // 使用assert_abort来验证错误码
        assert_abort!(
            trading_pair::create_pair<token_factory::TokenInfo, usdt_mock::USDT>(
                creator,
                creator_addr,
                signer::address_of(admin),
                30, // fee_rate
                1000000, // min_trade_amount
                insufficient_deposit
            ),
            trading_pair::E_INSUFFICIENT_DEPOSIT
        );
    }

    #[test(admin = @0x1, creator = @0x2, trader = @0x3)]
    public fun test_swap_token_to_usdt(admin: &signer, creator: &signer, trader: &signer) {
        // 初始化模块
        token_factory::init_module(admin);
        trading_pair::init_module(admin);
        usdt_mock::initialize_usdt(admin);
        
        // 为创建者和交易者注册USDT
        usdt_mock::register_usdt(creator);
        usdt_mock::register_usdt(trader);
        
        // 为创建者铸造USDT用于保证金
        let usdt_deposit = 1000000000; // 1000 USDT
        usdt_mock::mint_usdt(admin, signer::address_of(creator), usdt_deposit * 2);
        
        // 为交易者铸造一些USDT用于交易
        let trader_usdt_amount = 100000000; // 100 USDT
        usdt_mock::mint_usdt(admin, signer::address_of(trader), trader_usdt_amount);
        
        // 创建代币
        let initial_token_supply = 1000000000; // 10000 tokens
        token_factory::create_token(
            creator,
            b"Test Token",
            b"TEST",
            8,
            initial_token_supply,
            true
        );
        
        // 将一些代币转移给交易者
        let trader_token_amount = 100000000; // 1000 tokens
        token_factory::transfer<token_factory::TokenInfo>(
            creator,
            signer::address_of(trader),
            trader_token_amount
        );
        
        // 创建交易对
        let creator_addr = signer::address_of(creator);
        let fee_rate = 30; // 0.3%
        let min_trade_amount = 1000000; // 1 USDT
        
        trading_pair::create_pair<token_factory::TokenInfo, usdt_mock::USDT>(
            creator,
            creator_addr,
            signer::address_of(admin),
            fee_rate,
            min_trade_amount,
            usdt_deposit
        );
        
        // 执行代币到USDT的交换
        let trade_amount = 10000000; // 100 tokens
        let min_output = 1000000; // 1 USDT minimum
        
        trading_pair::swap<token_factory::TokenInfo, usdt_mock::USDT>(
            trader,
            creator_addr, // pair_address
            creator_addr, // token_in_address (代币地址)
            trade_amount,
            min_output
        );
        
        // 验证交易后余额变化
        let trader_token_balance = token_factory::get_balance<token_factory::TokenInfo>(signer::address_of(trader));
        let trader_usdt_balance = usdt_mock::get_usdt_balance(signer::address_of(trader));
        
        assert!(trader_token_balance == trader_token_amount - trade_amount, 1);
        // 由于AMM公式，USDT余额应该增加（减去手续费）
        assert!(trader_usdt_balance > 0, 2);
    }

    #[test(admin = @0x1, creator = @0x2)]
    public fun test_fee_rate_limits(admin: &signer, creator: &signer) {
        // 初始化模块
        token_factory::init_module(admin);
        trading_pair::init_module(admin);
        usdt_mock::initialize_usdt(admin);
        
        // 为创建者注册USDT
        usdt_mock::register_usdt(creator);
        
        // 为创建者铸造USDT
        let usdt_deposit = 1000000000; // 1000 USDT
        usdt_mock::mint_usdt(admin, signer::address_of(creator), usdt_deposit * 2);
        
        // 创建代币
        token_factory::create_token(
            creator,
            b"Test Token",
            b"TEST",
            8,
            1000000,
            true
        );
        
        // 尝试创建手续费率超过最大限制的交易对，应该失败
        let creator_addr = signer::address_of(creator);
        let invalid_fee_rate = 2000; // 20%，超过最大限制10%
        
        // 使用assert_abort来验证错误码
        assert_abort!(
            trading_pair::create_pair<token_factory::TokenInfo, usdt_mock::USDT>(
                creator,
                creator_addr,
                signer::address_of(admin),
                invalid_fee_rate,
                1000000, // min_trade_amount
                usdt_deposit
            ),
            trading_pair::E_INVALID_FEE_RATE
        );
    }
}