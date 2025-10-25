module aptos_dex::usdt_mock {
    use std::signer;
    use std::string;
    use aptos_framework::coin::{Self, MintCapability, BurnCapability, FreezeCapability};

    /// USDT模拟代币结构
    struct USDT has key {}

    /// USDT能力存储
    struct USDTCapabilities has key {
        mint_cap: MintCapability<USDT>,
        burn_cap: BurnCapability<USDT>,
        freeze_cap: FreezeCapability<USDT>,
    }

    /// 初始化USDT代币
    public entry fun initialize_usdt(admin: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<USDT>(
            admin,
            string::utf8(b"USD Tether"),
            string::utf8(b"USDT"),
            6, // 6位小数
            true, // 监控供应量
        );

        // 存储能力
        move_to(admin, USDTCapabilities {
            mint_cap,
            burn_cap,
            freeze_cap,
        });
    }

    /// 铸造USDT给用户（仅用于测试）
    public entry fun mint_usdt(
        admin: &signer,
        to: address,
        amount: u64,
    ) acquires USDTCapabilities {
        let caps = borrow_global<USDTCapabilities>(signer::address_of(admin));
        let coins = coin::mint<USDT>(amount, &caps.mint_cap);
        coin::deposit(to, coins);
    }

    /// Get USDT balance
    #[view]
    public fun get_usdt_balance(account: address): u64 {
        coin::balance<USDT>(account)
    }

    /// 注册USDT账户
    public entry fun register_usdt(account: &signer) {
        coin::register<USDT>(account);
    }
}
