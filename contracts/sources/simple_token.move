module aptos_dex::simple_token {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::coin::{Self, MintCapability, BurnCapability, FreezeCapability};
    use aptos_framework::event;

    /// Token metadata
    struct TokenMetadata<phantom CoinType> has key {
        name: String,
        symbol: String,
        decimals: u8,
        creator: address,
    }

    /// Token creation event
    struct TokenCreatedEvent has drop, store {
        creator: address,
        name: String,
        symbol: String,
        decimals: u8,
        initial_supply: u64,
    }

    /// Create a new token
    public entry fun create_token<CoinType>(
        creator: &signer,
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u8,
        initial_supply: u64,
        monitor_supply: bool,
    ) {
        let creator_addr = signer::address_of(creator);
        let name_str = string::utf8(name);
        let symbol_str = string::utf8(symbol);

        // Initialize the coin
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<CoinType>(
            creator,
            name_str,
            symbol_str,
            decimals,
            monitor_supply,
        );

        // Mint initial supply
        if (initial_supply > 0) {
            let coins = coin::mint<CoinType>(initial_supply, &mint_cap);
            coin::deposit(creator_addr, coins);
        };

        // Store metadata
        move_to(creator, TokenMetadata<CoinType> {
            name: name_str,
            symbol: symbol_str,
            decimals,
            creator: creator_addr,
        });

        // Destroy capabilities for simplicity
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_freeze_cap(freeze_cap);
        coin::destroy_mint_cap(mint_cap);

        // Emit event
        event::emit(TokenCreatedEvent {
            creator: creator_addr,
            name: name_str,
            symbol: symbol_str,
            decimals,
            initial_supply,
        });
    }

    /// Get token metadata
    #[view]
    public fun get_metadata<CoinType>(creator: address): (String, String, u8, address) acquires TokenMetadata {
        let metadata = borrow_global<TokenMetadata<CoinType>>(creator);
        (metadata.name, metadata.symbol, metadata.decimals, metadata.creator)
    }
}
