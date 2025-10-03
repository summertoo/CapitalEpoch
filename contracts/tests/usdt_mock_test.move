#[test_only]
module aptos_dex::usdt_mock_test {
    use std::signer;
    use aptos_dex::usdt_mock;
    use aptos_framework::coin;

    #[test(admin = @0x1, user = @0x2)]
    public fun test_usdt_lifecycle(admin: &signer, user: &signer) {
        // 初始化USDT代币
        usdt_mock::initialize_usdt(admin);
        
        // 为用户注册USDT
        usdt_mock::register_usdt(user);
        
        // 验证初始余额为0
        let user_addr = signer::address_of(user);
        let initial_balance = usdt_mock::get_usdt_balance(user_addr);
        assert!(initial_balance == 0, 1);
        
        // 为用户铸造USDT
        let mint_amount = 1000000000; // 1000 USDT
        usdt_mock::mint_usdt(admin, user_addr, mint_amount);
        
        // 验证铸造后的余额
        let balance_after_mint = usdt_mock::get_usdt_balance(user_addr);
        assert!(balance_after_mint == mint_amount, 2);
    }

    #[test(admin = @0x1, user1 = @0x2, user2 = @0x3)]
    public fun test_multiple_users(admin: &signer, user1: &signer, user2: &signer) {
        // 初始化USDT代币
        usdt_mock::initialize_usdt(admin);
        
        // 为用户注册USDT
        usdt_mock::register_usdt(user1);
        usdt_mock::register_usdt(user2);
        
        // 为用户1铸造USDT
        let user1_amount = 1000000000; // 1000 USDT
        usdt_mock::mint_usdt(admin, signer::address_of(user1), user1_amount);
        
        // 为用户2铸造不同的USDT数量
        let user2_amount = 500000000; // 500 USDT
        usdt_mock::mint_usdt(admin, signer::address_of(user2), user2_amount);
        
        // 验证各自余额
        let balance1 = usdt_mock::get_usdt_balance(signer::address_of(user1));
        let balance2 = usdt_mock::get_usdt_balance(signer::address_of(user2));
        
        assert!(balance1 == user1_amount, 1);
        assert!(balance2 == user2_amount, 2);
        assert!(balance1 != balance2, 3);
    }

    #[test(admin = @0x1, user = @0x2)]
    public fun test_usdt_decimals(admin: &signer, user: &signer) {
        // 初始化USDT代币
        usdt_mock::initialize_usdt(admin);
        
        // 为用户注册USDT
        usdt_mock::register_usdt(user);
        
        // 铸造1 USDT (6位小数)
        let one_usdt = 1000000; // 1 USDT with 6 decimals
        usdt_mock::mint_usdt(admin, signer::address_of(user), one_usdt);
        
        // 验证余额
        let balance = usdt_mock::get_usdt_balance(signer::address_of(user));
        assert!(balance == one_usdt, 1);
    }
}