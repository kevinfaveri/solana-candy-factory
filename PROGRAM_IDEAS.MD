# PROGRAM IDEAS

There are three key features I miss in the candy machine: splitting the minting funds between multiple creators (currently, it only works for royalties); allowing for discount codes; and allowing for a invite chain idea that gives discount (like, if you invite someone you have discount on minting). Of course, all of them could be combined into a single program.

## Minting Funds Manager Program

Should be a simple program that receives money on its address (thus, acting as the treasury) and allow for withdrawl:

- It should implement the a function for receiving the Solanas that splits the Solanas between multiple actors (wallets hardcoded on the program, each one having their share).
- It should implement a withdrawl funds function that only the wallets hardcoded in the contract can use. When the function is called it validates on the map how much the actor can withdraw and then allow the withdraw of money that is on the contract. Then, it should update the map to reflect that withdrawed this value.

## Discount Codes Program

Should be a simple program that acts as a proxy for the a Metaplex candy machine program:

- It should hardcode the candy machine address that will be used
- It should have a deposit SOL function which only the owner of the program can use
- It should have a withdraw SOL function which only the owner of the program can use
- It should have a add discount code function which receives a param: code, discount value, and how many times can be used before expiring
- It should have a remove discount code function which receives a param: code and discount value
- It should feature a mintWithDiscount function which receives a discount code param, calculates the value to be charged from the wallet requesting it based on the discount, and then mint the token, and sends it to the wallet that was requesting it. After this work is finished, it should also keep track that the discount code has been used and is now invalid

## Invite Chain Program

Should be a simple program that acts as a proxy for the a Metaplex candy machine program:

- It should hardcode the candy machine address that will be used
- It should have a deposit SOL function which only the owner of the program can use
- It should have a withdraw SOL function which only the owner of the program can use
- It should feature a minting map which keep track of how many an invite code (wallet adress) has invited 
- It should feature a mint function which receives the invite code (wallet adress) and the wallet adress requesting it, of course. The value for the mint is then calculated based on how many the wallet adress requesting it has invited so far, then charges it on this value, and use the treasury Solanas (value currently held in the program) to really mint on the candy machine and send to the wallet that requested it (thus this is the gray area where business rules logics could be decided)