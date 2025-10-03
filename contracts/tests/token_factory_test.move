#[test_only]
module aptos_dex::token_factory_test {
    use std::signer;
    use aptos_dex::token_factory;
    use aptos_framework::coin;

    #[test(admin = @0x1, creator = @0x2)]
    public fun test_token_lifecycle(admin: &signer, creator: &signer) {
        // 初始化模块
        token_factory::init_module(admin);
        
        // 创建代币
        let name = b"Test Token";
        let symbol = b"TEST";
        let decimals = 8;
        let initial_supply = 1000000;
        let monitor_supply = true;
        
        token_factory::create_token(
            creator,
            name,
            symbol,
            decimals,
            initial_supply,
            monitor_supply
        );

        // 验证代币是否存在
        let creator_addr = signer::address_of(creator);
        assert!(token_factory::token_exists(creator_addr), 1);
        
        // 验证代币信息
        let (token_name, token_symbol, token_decimals, token_supply, token_creator, _) = 
            token_factory::get_token_info(creator_addr);
        
        assert!(token_name == string::utf8(name), 2);
        assert!(token_symbol == string::utf8(symbol), 3);
        assert!(token_decimals == decimals, 4);
        assert!(token_supply == initial_supply, 5);
        assert!(token_creator == creator_addr, 6);
        
        // 验证创建者余额
        let balance = token_factory::get_balance<token_factory::TokenInfo>(creator_addr);
        assert!(balance == initial_supply, 7);
    }

    #[test(admin = @0x1, creator1 = @0x2, creator2 = @0x3)]
    public fun test_multiple_tokens(admin: &signer, creator1: &signer, creator2: &signer) {
        // 初始化模块
        token_factory::init_module(admin);
        
        // 创建第一个代币
        token_factory::create_token(
            creator1,
            b"Token1",
            b"TK1",
            8,
            1000000,
            true
        );
        
        // 创建第二个代币
        token_factory::create_token(
            creator2,
            b"Token2",
            b"TK2",
            6,
            500000,
            true
        );

        // 验证两个代币都存在
        let creator1_addr = signer::address_of(creator1);
        let creator2_addr = signer::address_of(creator2);
        
        assert!(token_factory::token_exists(creator1_addr), 1);
        assert!(token_factory::token_exists(creator2_addr), 2);
        
        // 验证代币信息
        let (_, _, decimals1, _, _, _) = token_factory::get_token_info(creator1_addr);
        let (_, _, decimals2, _, _, _) = token_factory::get_token_info(creator2_addr);
        
        assert!(decimals1 == 8, 3);
        assert!(decimals2 == 6, 4);
    }

    #[test(admin = @0x1, creator = @0x2, receiver = @0x3)]
    public fun test_token_transfer(admin: &signer, creator: &signer, receiver: &signer) {
        // 初始化模块
        token_factory::init_module(admin);
        
        // 创建代币
        let initial_supply = 1000000;
        token_factory::create_token(
            creator,
            b"Transfer Token",
            b"TRT",
            8,
            initial_supply,
            true
        );

        // 转账前余额
        let creator_addr = signer::address_of(creator);
        let receiver_addr = signer::address_of(receiver);
        let creator_balance_before = token_factory::get_balance<token_factory::TokenInfo>(creator_addr);
        let receiver_balance_before = token_factory::get_balance<token_factory::TokenInfo>(receiver_addr);
        
        assert!(creator_balance_before == initial_supply, 1);
        assert!(receiver_balance_before == 0, 2);
        
        // 执行转账
        let transfer_amount = 100000;
        token_factory::transfer<token_factory::TokenInfo>(
            creator,
            receiver_addr,
            transfer_amount
        );
        
        // 验证转账后余额
        let creator_balance_after = token_factory::get_balance<token_factory::TokenInfo>(creator_addr);
        let receiver_balance_after = token_factory::get_balance<token_factory::TokenInfo>(receiver_addr);
        
        assert!(creator_balance_after == initial_supply - transfer_amount, 3);
        assert!(receiver_balance_after == transfer_amount, 4);
    }

    #[test(admin = @0x1, creator = @0x2)]
    public fun test_invalid_supply(admin: &signer, creator: &signer) {
        // 初始化模块
        token_factory::init_module(admin);
        
        // 尝试创建供应量为0的代币，应该失败
        let initial_supply = 0;
        
        // 使用assert_abort来验证错误码
        assert_abort!(
            token_factory::create_token(
                creator,
                b"Invalid Token",
                b"INV",
                8,
                initial_supply,
                true
            ),
            token_factory::E_INVALID_SUPPLY
        );
    }
}