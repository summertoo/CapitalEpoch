module aptos_dex::facility {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_dex::commercial_street;

    /// 错误码
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_FACILITY_ALREADY_EXISTS: u64 = 2;
    const E_FACILITY_NOT_EXISTS: u64 = 3;
    const E_STREET_NOT_EXISTS: u64 = 4;
    const E_INVALID_FACILITY_TYPE: u64 = 5;
    const E_INSUFFICIENT_BALANCE: u64 = 6;

    /// 设施类型枚举
    const FACILITY_TYPE_SHOP: u8 = 1;       // 商店
    const FACILITY_TYPE_BAR: u8 = 2;        // 酒吧
    const FACILITY_TYPE_SCHOOL: u8 = 3;     // 学校
    const FACILITY_TYPE_STORE: u8 = 4;      // 小卖部
    const FACILITY_TYPE_CLOTHING: u8 = 5;   // 服装店

    /// 设施信息
    struct FacilityInfo has key, store {
        id: u64,                    // 设施ID
        street_address: address,    // 关联的商业街地址
        facility_type: u8,          // 设施类型
        name: String,               // 设施名称
        description: String,        // 设施描述
        owner: address,             // 所有者
        construction_cost: u64,     // 建设成本
        maintenance_cost: u64,      // 维护费用
        revenue: u64,               // 累计收益
        level: u8,                  // 设施等级
        created_at: u64,            // 创建时间
        last_maintenance: u64,      // 上次维护时间
    }

    /// 设施注册表
    struct FacilityRegistry has key {
        facilities: vector<address>,   // 所有设施地址
        next_id: u64,                  // 下一个ID
    }

    /// 设施创建事件
    #[event]
    struct FacilityCreatedEvent has drop, store {
        facility_address: address,
        id: u64,
        street_address: address,
        facility_type: u8,
        name: String,
        owner: address,
        construction_cost: u64,
        created_at: u64,
    }

    /// 设施升级事件
    #[event]
    struct FacilityUpgradedEvent has drop, store {
        facility_address: address,
        level: u8,
        upgrade_cost: u64,
        upgraded_at: u64,
    }

    /// 设施收益事件
    #[event]
    struct FacilityRevenueEvent has drop, store {
        facility_address: address,
        revenue: u64,
        collected_at: u64,
    }

    /// 初始化模块
    fun init_module(admin: &signer) {
        move_to(admin, FacilityRegistry {
            facilities: vector::empty(),
            next_id: 1,
        });
    }

    /// 创建设施
    public entry fun create_facility<USDT>(
        owner: &signer,
        street_address: address,
        facility_type: u8,
        name: vector<u8>,
        description: vector<u8>,
        construction_cost: u64,
    ) acquires FacilityRegistry {
        let owner_addr = signer::address_of(owner);
        
        // 验证参数
        assert!(facility_type >= 1 && facility_type <= 5, E_INVALID_FACILITY_TYPE);
        assert!(commercial_street::street_exists(street_address), E_STREET_NOT_EXISTS);

        // 检查USDT余额
        let usdt_balance = coin::balance<USDT>(owner_addr);
        assert!(usdt_balance >= construction_cost, E_INSUFFICIENT_BALANCE);

        // 转移建设成本到合约
        let usdt_coins = coin::withdraw<USDT>(owner, construction_cost);
        // 这里应该将USDT存入某个资金池，简化处理直接销毁
        coin::destroy_zero(usdt_coins);

        // 创建设施信息
        let registry = borrow_global_mut<FacilityRegistry>(@aptos_dex);
        let facility_id = registry.next_id;
        registry.next_id = registry.next_id + 1;

        let facility_info = FacilityInfo {
            id: facility_id,
            street_address,
            facility_type,
            name: string::utf8(name),
            description: string::utf8(description),
            owner: owner_addr,
            construction_cost,
            maintenance_cost: construction_cost / 10, // 维护费用为建设成本的10%
            revenue: 0,
            level: 1,
            created_at: timestamp::now_seconds(),
            last_maintenance: timestamp::now_seconds(),
        };

        // 存储到所有者账户
        move_to(owner, facility_info);

        // 更新注册表
        vector::push_back(&mut registry.facilities, owner_addr);

        // 发出事件
        event::emit(FacilityCreatedEvent {
            facility_address: owner_addr,
            id: facility_id,
            street_address,
            facility_type,
            name: string::utf8(name),
            owner: owner_addr,
            construction_cost,
            created_at: timestamp::now_seconds(),
        });
    }

    /// 升级设施
    public entry fun upgrade_facility<USDT>(
        owner: &signer,
        facility_address: address,
        upgrade_cost: u64,
    ) acquires FacilityInfo {
        let owner_addr = signer::address_of(owner);
        
        // 验证设施是否存在
        assert!(exists<FacilityInfo>(facility_address), E_FACILITY_NOT_EXISTS);
        
        // 验证所有权
        let facility_info = borrow_global_mut<FacilityInfo>(facility_address);
        assert!(facility_info.owner == owner_addr, E_NOT_AUTHORIZED);

        // 检查USDT余额
        let usdt_balance = coin::balance<USDT>(owner_addr);
        assert!(usdt_balance >= upgrade_cost, E_INSUFFICIENT_BALANCE);

        // 转移升级费用
        let usdt_coins = coin::withdraw<USDT>(owner, upgrade_cost);
        // 这里应该将USDT存入某个资金池，简化处理直接销毁
        coin::destroy_zero(usdt_coins);

        // 升级设施
        facility_info.level = facility_info.level + 1;
        facility_info.revenue = facility_info.revenue + upgrade_cost / 2; // 升级费用的一部分转化为收益
        facility_info.maintenance_cost = facility_info.maintenance_cost + upgrade_cost / 20; // 增加维护费用

        // 发出事件
        event::emit(FacilityUpgradedEvent {
            facility_address,
            level: facility_info.level,
            upgrade_cost,
            upgraded_at: timestamp::now_seconds(),
        });
    }

    /// 收取设施收益
    public entry fun collect_revenue<USDT>(
        owner: &signer,
        facility_address: address,
        amount: u64,
    ) acquires FacilityInfo {
        let owner_addr = signer::address_of(owner);
        
        // 验证设施是否存在
        assert!(exists<FacilityInfo>(facility_address), E_FACILITY_NOT_EXISTS);
        
        // 验证所有权
        let facility_info = borrow_global_mut<FacilityInfo>(facility_address);
        assert!(facility_info.owner == owner_addr, E_NOT_AUTHORIZED);
        
        // 验证收益金额
        assert!(facility_info.revenue >= amount, E_INSUFFICIENT_BALANCE);

        // 扣除收益
        facility_info.revenue = facility_info.revenue - amount;

        // 转移收益给所有者
        // 这里简化处理，实际应该铸造或从资金池转移USDT给所有者
        // 为简化，我们只更新收益记录

        // 发出事件
        event::emit(FacilityRevenueEvent {
            facility_address,
            revenue: amount,
            collected_at: timestamp::now_seconds(),
        });
    }

    /// Get facility information
    #[view]
    public fun get_facility_info(facility_address: address): (u64, address, u8, String, String, address, u64, u64, u64, u8, u64, u64) acquires FacilityInfo {
        assert!(exists<FacilityInfo>(facility_address), E_FACILITY_NOT_EXISTS);
        let facility_info = borrow_global<FacilityInfo>(facility_address);
        (
            facility_info.id,
            facility_info.street_address,
            facility_info.facility_type,
            facility_info.name,
            facility_info.description,
            facility_info.owner,
            facility_info.construction_cost,
            facility_info.maintenance_cost,
            facility_info.revenue,
            facility_info.level,
            facility_info.created_at,
            facility_info.last_maintenance
        )
    }

    /// Get all facilities
    #[view]
    public fun get_all_facilities(): vector<address> acquires FacilityRegistry {
        let registry = borrow_global<FacilityRegistry>(@aptos_dex);
        registry.facilities
    }

    /// Get facilities on a commercial street
    #[view]
    public fun get_street_facilities(street_address: address): vector<address> acquires FacilityRegistry, FacilityInfo {
        let registry = borrow_global<FacilityRegistry>(@aptos_dex);
        let street_facilities = vector::empty<address>();
        let i = 0;
        let len = vector::length(&registry.facilities);
        
        while (i < len) {
            let facility_addr = *vector::borrow(&registry.facilities, i);
            if (exists<FacilityInfo>(facility_addr)) {
                let facility_info = borrow_global<FacilityInfo>(facility_addr);
                if (facility_info.street_address == street_address) {
                    vector::push_back(&mut street_facilities, facility_addr);
                };
            };
            i = i + 1;
        };
        
        street_facilities
    }

    /// Get facilities owned by a user
    #[view]
    public fun get_user_facilities(user: address): vector<address> acquires FacilityRegistry, FacilityInfo {
        let registry = borrow_global<FacilityRegistry>(@aptos_dex);
        let user_facilities = vector::empty<address>();
        let i = 0;
        let len = vector::length(&registry.facilities);
        
        while (i < len) {
            let facility_addr = *vector::borrow(&registry.facilities, i);
            if (exists<FacilityInfo>(facility_addr)) {
                let facility_info = borrow_global<FacilityInfo>(facility_addr);
                if (facility_info.owner == user) {
                    vector::push_back(&mut user_facilities, facility_addr);
                };
            };
            i = i + 1;
        };
        
        user_facilities
    }

    /// Check if facility exists
    #[view]
    public fun facility_exists(facility_address: address): bool {
        exists<FacilityInfo>(facility_address)
    }

    /// Get facility type name
    #[view]
    public fun get_facility_type_name(facility_type: u8): String {
        if (facility_type == FACILITY_TYPE_SHOP) {
            string::utf8(b"Shop")
        } else if (facility_type == FACILITY_TYPE_BAR) {
            string::utf8(b"Bar")
        } else if (facility_type == FACILITY_TYPE_SCHOOL) {
            string::utf8(b"School")
        } else if (facility_type == FACILITY_TYPE_STORE) {
            string::utf8(b"Store")
        } else if (facility_type == FACILITY_TYPE_CLOTHING) {
            string::utf8(b"Clothing Store")
        } else {
            string::utf8(b"Unknown")
        }
    }

    #[test_only]
    use std::vector;

    #[test(admin = @aptos_dex, creator = @0x123)]
    public fun test_create_facility(admin: &signer, creator: &signer) acquires FacilityRegistry {
        init_module(admin);
        // 测试代码...
    }
}
