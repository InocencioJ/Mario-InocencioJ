
/* Game namespace */
var game = {

	// an object where to store game information
	data : {
		// score
		score : 0
	},
	
	
	// Run on page load.
	"onload" : function () {
	// Initialize the video.
	if (!me.video.init("screen",  me.video.CANVAS, 1067, 600, true, 1.0)) {
		alert("Your browser does not support HTML5 canvas.");
		return;
	}

	// add "#debug" to the URL to enable the debug Panel
	if (document.location.hash === "#debug") {
		window.onReady(function () {
			me.plugin.register.defer(this, debugPanel, "debug");
		});
	}

	// Initialize the audio.
	me.audio.init("mp3,ogg");

	// Set a callback to run when loading is complete.
	me.loader.onload = this.loaded.bind(this);

	// Load the resources.
	me.loader.preload(game.resources);

	// Initialize melonJS and display a loading screen.
	me.state.change(me.state.LOADING);
},

	// Run on game resources loaded.
	"loaded" : function () {
               me.pool.register("mario", game.PlayerEntity, true);
               me.pool.register("BadGuy", game.BadGuy);
               me.pool.register("mushroom", game.Mushroom);
               /*the codes above tell the proograms that the objects exist and are able to be used*/
            
                me.pool.register("levelTrigger", game.LevelTrigger);
                /*this code allows the player to go to a new level*/
            
		me.state.set(me.state.MENU, new game.TitleScreen());
                me.state.set(me.state.PLAY, new game.PlayScreen());
                /*the code takes the player to the menu screen then to the play screen*/

		// Start the game.
		me.state.change(me.state.MENU);
	}
};
