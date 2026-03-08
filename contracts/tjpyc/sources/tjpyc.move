module tjpyc_coin::tjpyc {
    use sui::coin::{Self, TreasuryCap};
    use sui::url;

    /// The type identifier of coin. The coin will have a type
    /// tag of kind: `Coin<package_object::tjpyc::TJPYC>`
    public struct TJPYC has drop {}

    /// Module initializer is called once on module publish.
    /// A treasury cap is sent to the publisher, who then shares it.
    fun init(witness: TJPYC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness, 
            9, // decimal places (same as SUI for simplicity)
            b"TJPYC", // symbol
            b"Test JPYC", // name
            b"Dummy JPYC for Sui Dev Hub Testing", // description
            option::some(url::new_unsafe_from_bytes(b"https://jpyc.jp/favicon.ico")), // icon url
            ctx
        );
        
        // freeze the metadata object, since we don't need to change it
        transfer::public_freeze_object(metadata);

        // Share the treasury cap so anyone can mint tokens via our faucet function
        transfer::public_share_object(treasury_cap);
    }

    /// Faucet function: Anyone can call this to mint 10,000 TJPYC to themselves
    public fun mint_to_sender(
        treasury_cap: &mut TreasuryCap<TJPYC>, 
        ctx: &mut TxContext
    ) {
        // Mint 10,000 TJPYC (accounting for 9 decimals)
        let amount = 10_000 * 1_000_000_000;
        coin::mint_and_transfer(treasury_cap, amount, ctx.sender(), ctx);
    }
}
