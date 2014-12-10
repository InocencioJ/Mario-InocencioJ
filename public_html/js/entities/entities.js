// TODO
game.PlayerEntity = me.Entity.extend({
    /*playerentity is about how the player move to changing its size*/
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                width: 128,
                height: 128,
                getShape: function() {
                    return (new me.Rect(0, 0, 30, 128)).toPolygon();
                }
            }]);

        this.renderable.addAnimation("idle", [3]);
        this.renderable.addAnimation("bigIdle", [19]);
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("shrink", [0, 1, 2, 3], 80);
        this.renderable.addAnimation("grow", [4, 5, 6, 7], 80);
        /*this code allows the player animation to move 
         *the 80 at the end tell the animation how fast the animation is going to move*/
        this.renderable.setCurrentAnimation("idle");
        
        this.big = false;
        this.body.setVelocity(5, 20);
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        /*the velocity code sets the code so move at a specific speed
         *the viewport code makes the camera follow mthe player*/
    },
    update: function(delta) {
        if (me.input.isKeyPressed("right")) {
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.flipX(false);
            /*the pressed key checks if the right key is pressed*/
        }else if(me.input.isKeyPressed("left")){
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            this.flipX(true);
            /*if the left key is pressed the player will go left*/
        }else{
            this.body.vel.x = 0;
            /*this code combines the volocity and position of the player to make him move*/
        }
        if(me.input.isKeyPressed("up")){
            if(!this.body.jumping && !this.body.falling){
                  this.body.jumping = true;
                  this.body.vel.y -=this.body.accel.y *me.timer.tick;
                  /*if the up arrow is pressed the player will jump*/
            }
        }

        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        if(!this.big){
        if(this.body.vel.x !== 0) {
            if(!this.renderable.isCurrentAnimation("smallWalk")&& !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                  this.renderable.setCurrentAnimation("smallWalk");
                  this.renderable.setAnimationFrame();
                  /*this code makes the person do the action smallwalk*/
            }
        }else{
               this.renderable.setCurrentAnimation("idle");
        } 
        }else{
        if (this.body.vel.x !== 0) {
            if(!this.renderable.isCurrentAnimation("bigWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                  this.renderable.setCurrentAnimation("bigWalk");
                  this.renderable.setAnimationFrame();
                  /*this code makes the person who does the action bigwalk if eaten a mushroom*/
            }
        }else{
            this.renderable.setCurrentAnimation("bigIdle");
                    /*if nothing is pressed after eaten a mushroom the player will stay idled*/
        }   
    }
        
        this._super(me.Entity, "update", [delta]);
        return true;
        
    },
    collideHandler: function(response) {
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);
        
        if(response.b.type === 'BadGuy'){
            if(ydif <= -115){
                response.b.alive = false;
                /*if the bad guy is alive do not remove badguy*/
            }else{
                if(this.big){
                    this.big = false;
                    this.body.vel.y -= this.body.accel.y * me.timer.tick;
                    this.jumping = true;
                    this.renderable.setCurrentAnimation("shrink", "idle");
                    this.renderable.setAnimationFrame();
                    /*if  badguy collides with player player will shrink if eaten a mushroom*/
                }else{
                    me.state.change(me.state.MENU);
                    /*if player has not eaten a mushroom player will go to menu*/
             }
        }
      }else if(response.b.type ==='mushroom'){
          this.renderable.setCurrentAnimation("grow", "bigIdle");
          this.big = true;
          /*if player eats mushroom player will grow*/
          me.game.world.removeChild(response.b);
      }
   
    
   }


});

game.LevelTrigger = me.Entity.extend({
    /*LeverTrigger allows the player to choose were to spawn on the map*/
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        /*if some thing hits the player the player this code will push the action 
         *to the collision code*/
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
        /*when the player collides with a level collision box it will respawn in a new map*/
    },
    onCollision: function() {
        /*this code will make the hit box of a object an limit it from its self from being hit again*/
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    }

});

game.BadGuy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "slime",
                spritewidth: "60",
                spriteheight: "28",
                width: 60,
                height: 28,
                getShape: function() {
                    return (new me.Rect(0, 0, 60, 28)).toPolygon();
                }
            }]);
        
        this.spritewidth = 60;
        var width = settings.width;
        x = this.pos.x;
        this.startX = x;
        this.endX = x + width - this.spritewidth;
        this.pos.x = x + width - this.spritewidth;
        this.updateBounds();
        /*this code tells the badguy how far he could go until he needs to turn around*/
        
        this.alwaysUpdate = true;
        
        this.walkLeft = false;
        this.alive = true;
        this.type = "BadGuy";
        /*badguy keeps on moving until he is not alive*/
        
        this.renderable.addAnimation("run", [0, 1, 2], 80);
        /*this sets the badguys movent speed*/
        
        this.body.setVelocity(4, 6);
        
     },
    update: function(delta) {
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        if(this.alive){
            if(this.walkLeft && this.pos.x <= this.startX){
                this.walkLeft = false; 
        }else if(!this.walkLeft && this.pos.x >= this.endX){
               this.walkLeft = true;
        }/*if the badguy is alive he will go left then right in a repeating process*/
        this.flipX(!this.walkLeft);
        this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
            
        }else{
            me.game.world.removeChild(this);
            /*if badguy is not alive he will be removed*/
        }
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    collideHandler: function(){
    
    }



});

game.Mushroom = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mushroom",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function() {
                return (new me.Rect(0, 0, 64, 64)).toPolygon();
                    /*the mushroon is a 64 by 64 pixle block*/
                }
            }]);
        me.collision.check(this);
        this.type = "mushroom";
        /*check if i have collided with the mushroom*/
    }
});

