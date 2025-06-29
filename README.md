<<<<<<< HEAD
# Scratch-like Animation Project

A web-based animation tool similar to MIT Scratch, built with React.

## Features

### Basic Animation
- Drag and drop animation blocks to create scripts
- Multiple sprite types (Cat, Butterfly, Ball)
- Motion animations (move, turn, goto)
- Looks animations (say, think)
- Control blocks (repeat)

### Hero Section - Collision Detection & Animation Swapping
- **Enable Hero Section**: Check the "🎯 Hero Section" checkbox in the preview area
- **Collision Detection**: When two sprites' coordinates match (within 15px tolerance), a collision is detected
- **Animation Swapping**: When collision occurs with Hero Section enabled, the sprites' animation scripts are swapped
- **Visual Feedback**: 
  - Red "💥 COLLISION DETECTED!" indicator appears when sprites collide
  - Green "🎯 Hero Mode Active" indicator shows when Hero Section is enabled
  - Green "🎉 Animations Swapped Successfully!" notification appears after swapping

## How to Use

1. **Select Sprites**: Check the checkboxes for the sprites you want to animate
2. **Create Scripts**: 
   - Select a sprite tab in the middle area
   - Drag animation blocks from the sidebar to create scripts
   - Edit values by clicking on them
3. **Enable Hero Section**: Check the "🎯 Hero Section" checkbox if you want collision-based animation swapping
4. **Run Animations**: Click the "PLAY" button to start all selected sprite animations
5. **Watch for Collisions**: When sprites collide, their animations will swap (if Hero Section is enabled)

## Example Scenario

1. Select Butterfly and Ball sprites
2. Give Ball: "move 10" + "repeat 5"
3. Give Butterfly: "move -10" + "repeat 5"
4. Enable Hero Section checkbox
5. Click PLAY
6. When the sprites collide, their animations will swap:
   - Ball will now move -10 and repeat 5 times
   - Butterfly will now move 10 and repeat 5 times

## Technical Details

- Collision detection runs every 100ms
- Collision tolerance is 15 pixels
- Animation swapping has a 2-second cooldown to prevent rapid swapping
- Sprites maintain their positions during animation swapping
- All animations are properly aborted and restarted during swapping

## Development

```bash
npm install
npm start
```

The app will open at `http://localhost:3000`
=======
# Scratch_Clone
>>>>>>> 84e32520a57f1215580dab7149488d56fffa66ec
