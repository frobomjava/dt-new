$(function($){
    $.contextMenu({
        selector: '.context-menu-one',
        callback: function(key, options) {
            var m = "clicked: " + key;
            //window.console && console.log(m) || alert(m);
            PubSub.publish( 'contextMenuEvent',key);
        },
        items: {
            "Add Column Right": {name: "Add Column Right", icon: "add"},
            "Add Column Left": {name: "Add Column Left", icon: "add"},
            "Delete Column": {name: "Delete Column", icon: "delete"},
            "sep1": "---------",
            "Add Row Above": {name: "Add Row Above", icon: "add"},
            "Add Row Below": {name: "Add Row Below", icon: "add"},
            "Delete Row": {name: "Delete Row", icon: "delete"},
            "sep2": "---------",
            "quit": {name: "Quit", icon: function(){
                return 'context-menu-icon context-menu-icon-quit';
            }}
        }
    });

    $('.context-menu-one').on('click', function(e){
        //console.log('clicked', this);
    })
});
