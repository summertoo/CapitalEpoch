module aptos_dex::token_factory {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin, MintCapability, BurnCapability, FreezeCapability};
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    /// 错误码
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_TOKEN_ALREADY_EXISTS: u64 = 2;
    const E_INVALID_SUPPLY: u64 = 3;
    const E_INSUFFICIENT_BALANCE: u64 = 4;

    /// 代币信息结构
    struct TokenInfo has key, store {
        name: String,
        symbol: String,
        decimals: u8,
        total_supply: u64,
        creator: address,
        created_at: u64,
    }

    /// 代币注册表
    struct TokenRegistry has key {
        tokens: vector<address>,
    }

    /// 代币创建事件
    #[event]
    struct TokenCreatedEvent has drop, store {
        token_address: address,
        name: String,
        symbol: String,
        decimals: u8,
        total_supply: u64,
        creator: address,
        created_at: u64,
    }

    /// 代币转账事件
    #[event]
    struct TokenTransferEvent has drop, store {
        from: address,
        to: address,
        amount: u64,
        token_address: address,
    }

    /// 初始化模块
    fun init_module(admin: &signer) {
        move_to(admin, TokenRegistry {
            tokens: vector::empty(),
        });
    }

    /// 创建新代币
    public entry fun create_token(
        creator: &signer,
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u8,
        initial_supply: u64,
        monitor_supply: bool,
    ) acquires TokenRegistry {
        let creator_addr = signer::address_of(creator);
        
        // 验证参数
        assert!(initial_supply > 0, E_INVALID_SUPPLY);
        
        let name_str = string::utf8(name);
        let symbol_str = string::utf8(symbol);
        
        // 初始化代币
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<TokenInfo>(
            creator,
            name_str,
            symbol_str,
            decimals,
            monitor_supply,
        );

        // 铸造初始供应量
        let coins = coin::mint<TokenInfo>(initial_supply, &mint_cap);
        coin::deposit(creator_addr, coins);

        // 存储代币信息
        let token_info = TokenInfo {
            name: name_str,
            symbol: symbol_str,
            decimals,
            total_supply: initial_supply,
            creator: creator_addr,
            created_at: timestamp::now_seconds(),
        };

        move_to(creator, token_info);

        // 销毁能力（简化版本，实际项目中可能需要保留）
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_freeze_cap(freeze_cap);
        coin::destroy_mint_cap(mint_cap);

        // 更新注册表
        let registry = borrow_global_mut<TokenRegistry>(@aptos_dex);
        vector::push_back(&mut registry.tokens, creator_addr);

        // 发出事件
        event::emit(TokenCreatedEvent {
            token_address: creator_addr,
            name: name_str,
            symbol: symbol_str,
            decimals,
            total_supply: initial_supply,
            creator: creator_addr,
            created_at: timestamp::now_seconds(),
        });
    }

    /// Get token information
    #[view]
    public fun get_token_info(token_address: address): (String, String, u8, u64, address, u64) acquires TokenInfo {
        let token_info = borrow_global<TokenInfo>(token_address);
        (
            token_info.name,
            token_info.symbol,
            token_info.decimals,
            token_info.total_supply,
            token_info.creator,
            token_info.created_at
        )
    }

    /// Get token balance
    #[view]
    public fun get_balance<CoinType>(account_addr: address): u64 {
        coin::balance<CoinType>(account_addr)
    }

    /// Get all registered tokens
    #[view]
    public fun get_all_tokens(): vector<address> acquires TokenRegistry {
        let registry = borrow_global<TokenRegistry>(@aptos_dex);
        registry.tokens
    }

    /// Check if token exists
    #[view]
    public fun token_exists(token_address: address): bool {
        exists<TokenInfo>(token_address)
    }

    /// 转账代币
    public entry fun transfer<CoinType>(
        from: &signer,
        to: address,
        amount: u64,
    ) {
        let from_addr = signer::address_of(from);
        let coin = coin::withdraw<CoinType>(from, amount);
        coin::deposit(to, coin);

        // 发出转账事件
        event::emit(TokenTransferEvent {
            from: from_addr,
            to,
            amount,
            token_address: from_addr, // 简化处理
        });
    }

    #[test_only]
    use std::vector;

    #[test(admin = @aptos_dex, creator = @0x123)]
    public fun test_create_token(admin: &signer, creator: &signer) acquires TokenRegistry {
        // 初始化
        init_module(admin);
        
        // 创建代币
        create_token(
            creator,
            b"Test Token",
            b"TEST",
            8,
            1000000,
            true
        );

        // 验证代币信息
        let creator_addr = signer::address_of(creator);
        assert!(token_exists(creator_addr), 1);
        
        let (name, symbol, decimals, supply, creator_check, _) = get_token_info(creator_addr);
        assert!(name == string::utf8(b"Test Token"), 2);
        assert!(symbol == string::utf8(b"TEST"), 3);
        assert!(decimals == 8, 4);
        assert!(supply == 1000000, 5);
        assert!(creator_check == creator_addr, 6);
    }
}
