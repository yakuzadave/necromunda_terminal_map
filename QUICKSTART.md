# Quick Start Guide

## Playing Manufactorum Raid

### Setup (1 minute)
1. Open `index.html` in your browser
2. Select **"Manufactorum Raid"** from the Mission Select dropdown
3. Click **"New Battle"**

The map will generate with:
- 6 Marauders (M) in red at the bottom
- 5-8 Garrison defenders (G) in cyan at the top
- 3 bomb sites marked with `⊗`

### Gameplay Flow

#### Attacker Turn (Marauders)
1. **Select a Marauder** - Click on an `M` unit (it blinks white)
2. **Move** - Click an open space to move there
3. **Plant Bomb** - Move adjacent to a `⊗` marker, then click it
   - Marker changes to `◉` (armed) with counter = 1
4. Repeat for other units

#### Defender Turn (Garrison)
1. **Select a Garrison unit** - Click on a `G` unit
2. **Move** - Position near armed bombs
3. **Disarm Bomb** - Move adjacent to `◉`, then click it
   - Intelligence check (4+ roll)
   - Success: Bomb becomes `⊘` (disarmed)
   - Critical fail (doubles): Bomb explodes!

#### End of Round
1. Click **"End Round"** button
2. System automatically:
   - Rolls for each armed bomb (D6 + counter)
   - Detonates bombs that roll 7+
   - Spawns D3 defender reinforcements (Round 2+)
   - Checks victory conditions

### Bomb Timer Example
- Round 1: Bomb planted, counter = 1, need 6+ to explode (no explosion)
- Round 2: Counter = 2, need 5+ to explode (if rolled 5-6, boom!)
- Round 3: Counter = 3, need 4+ to explode (getting dangerous!)
- Round 4: Counter = 4, need 3+ to explode (very likely!)

### Victory
- **Attacker Wins**: All 3 bombs explode
- **Defender Wins**: Prevent explosions or eliminate all attackers

### Tips for Attackers
- Plant bombs early - they need time to detonate
- Protect planted bombs from defenders
- Rearm disarmed bombs when possible
- High-risk strategy: Plant all 3 quickly and defend

### Tips for Defenders
- Disarm bombs ASAP - the counter increases each round
- Position units near bomb sites before they're planted
- Use reinforcements to overwhelm attackers
- Block attacker movement to bomb sites

### Controls Reminder
- **Click unit → Click destination** = Move
- **Click unit → Click adjacent bomb** = Interact (Plant/Disarm/Rearm)
- **Hover any cell** = View detailed info in Cogitator Feed
- **End Round button** = Process timers and advance game state

## Other Scenarios

### Bushwhack
Standard ambush - eliminate enemy leaders.
- Simpler rules, good for learning the interface
- No objectives, just tactical combat

### Scrag
Assassination mission - one defender marked as priority target.
- Target marked with `[!]` in description
- Attacker wins by eliminating the target

### Mayhem
Cause maximum damage and extract.
- Inflict casualties and escape via deployment edge
- Most tactical scenario for experienced players

### Random Ambush
Randomly selects one of the three ambush scenarios above.

---

**Pro Tip**: Open browser console (F12) to see any error messages if something doesn't work.

**Note**: This is a tactical planning tool. Dice rolls for combat, injuries, and checks are simplified. Use this alongside your physical game for setup and planning!
