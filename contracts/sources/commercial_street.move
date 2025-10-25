module aptos_dex::commercial_street {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_dex::trading_pair;

    /// 错误码
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_STREET_ALREADY_EXISTS: u64 = 2;
    const E_STREET_NOT_EXISTS: u64 = 3;
    const E_PAIR_NOT_ASSOCIATED: u64 = 4;

    /// 商业街信息
    struct StreetInfo has key, store {
        id: u64,                    // 商业街ID
        name: String,               // 商业街名称
        description: String,        // 商业街描述
        creator: address,           // 创建者
        pair_address: address,      // 关联的交易对地址
        created_at: u64,            // 创建时间
        is_active: bool,            // 是否活跃
    }

    /// 商业街注册表
    struct StreetRegistry has key {
        streets: vector<address>,   // 所有商业街地址
        next_id: u64,               // 下一个ID
    }

    /// 商业街创建事件
    #[event]
    struct StreetCreatedEvent has drop, store {
        street_address: address,
        id: u64,
        name: String,
        creator: address,
        pair_address: address,
        created_at: u64,
    }

    /// 商业街更新事件
    #[event]
    struct StreetUpdatedEvent has drop, store {
        street_address: address,
        name: String,
        description: String,
        is_active: bool,
        updated_at: u64,
    }

    /// 初始化模块
    fun init_module(admin: &signer) {
        move_to(admin, StreetRegistry {
            streets: vector::empty(),
            next_id: 1,
        });
    }

    /// 创建商业街
    public entry fun create_street(
        creator: &signer,
        name: vector<u8>,
        description: vector<u8>,
        pair_address: address,
    ) acquires StreetRegistry {
        let creator_addr = signer::address_of(creator);
        
        // 验证交易对是否存在且由创建者创建
        assert!(trading_pair::pair_exists(pair_address), E_PAIR_NOT_ASSOCIATED);
        let (_, _, _, _, pair_creator, _, _, _, _) = trading_pair::get_pair_info(pair_address);
        assert!(pair_creator == creator_addr, E_NOT_AUTHORIZED);

        // 创建商业街信息
        let registry = borrow_global_mut<StreetRegistry>(@aptos_dex);
        let street_id = registry.next_id;
        registry.next_id = registry.next_id + 1;

        let street_info = StreetInfo {
            id: street_id,
            name: string::utf8(name),
            description: string::utf8(description),
            creator: creator_addr,
            pair_address,
            created_at: timestamp::now_seconds(),
            is_active: true,
        };

        // 存储到创建者账户
        move_to(creator, street_info);

        // 更新注册表
        vector::push_back(&mut registry.streets, creator_addr);

        // 发出事件
        event::emit(StreetCreatedEvent {
            street_address: creator_addr,
            id: street_id,
            name: string::utf8(name),
            creator: creator_addr,
            pair_address,
            created_at: timestamp::now_seconds(),
        });
    }

    /// 更新商业街信息
    public entry fun update_street(
        owner: &signer,
        name: vector<u8>,
        description: vector<u8>,
        is_active: bool,
    ) acquires StreetInfo {
        let owner_addr = signer::address_of(owner);
        
        // 验证商业街是否存在
        assert!(exists<StreetInfo>(owner_addr), E_STREET_NOT_EXISTS);
        
        // 验证所有权
        let street_info = borrow_global_mut<StreetInfo>(owner_addr);
        assert!(street_info.creator == owner_addr, E_NOT_AUTHORIZED);

        // 更新信息
        street_info.name = string::utf8(name);
        street_info.description = string::utf8(description);
        street_info.is_active = is_active;

        // 发出事件
        event::emit(StreetUpdatedEvent {
            street_address: owner_addr,
            name: street_info.name,
            description: street_info.description,
            is_active: street_info.is_active,
            updated_at: timestamp::now_seconds(),
        });
    }

    /// Get commercial street information
    #[view]
    public fun get_street_info(street_address: address): (u64, String, String, address, address, u64, bool) acquires StreetInfo {
        assert!(exists<StreetInfo>(street_address), E_STREET_NOT_EXISTS);
        let street_info = borrow_global<StreetInfo>(street_address);
        (
            street_info.id,
            street_info.name,
            street_info.description,
            street_info.creator,
            street_info.pair_address,
            street_info.created_at,
            street_info.is_active
        )
    }

    /// Get all commercial streets
    #[view]
    public fun get_all_streets(): vector<address> acquires StreetRegistry {
        let registry = borrow_global<StreetRegistry>(@aptos_dex);
        registry.streets
    }

    /// Get user created commercial streets
    #[view]
    public fun get_user_streets(user: address): vector<address> acquires StreetRegistry, StreetInfo {
        let registry = borrow_global<StreetRegistry>(@aptos_dex);
        let user_streets = vector::empty<address>();
        let i = 0;
        let len = vector::length(&registry.streets);
        
        while (i < len) {
            let street_addr = *vector::borrow(&registry.streets, i);
            if (exists<StreetInfo>(street_addr)) {
                let street_info = borrow_global<StreetInfo>(street_addr);
                if (street_info.creator == user) {
                    vector::push_back(&mut user_streets, street_addr);
                };
            };
            i = i + 1;
        };
        
        user_streets
    }

    /// Check if commercial street exists
    #[view]
    public fun street_exists(street_address: address): bool {
        exists<StreetInfo>(street_address)
    }

    #[test_only]
    use std::vector;

    #[test(admin = @aptos_dex, creator = @0x123)]
    public fun test_create_street(admin: &signer, creator: &signer) acquires StreetRegistry {
        init_module(admin);
        // 测试代码...
    }
}
