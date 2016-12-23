requirejs.config({
  paths: {
    'react': '/bower_components/react/react-with-addons',
    'reactdom': '/bower_components/react/react-dom',
    'jquery': '/bower_components/jquery/dist/jquery',
    'jquery.ui': '/bower_components/jquery-ui/jquery-ui',
    'classnames': '/bower_components/classnames/index',
    'bootstrap': '/bower_components/bootstrap/dist/js/bootstrap',
    'PubSub': '/bower_components/PubSubJS/src/pubsub',
    'jquery-contextMenu': '/bower_components/jQuery-contextMenu/src/jquery.contextMenu',
    'app': '/js'
  },

  shim: {
    'jquery.ui': ["jquery"],
    'bootstrap': ["jquery"],
  }

});

require(['jquery', 'react', 'reactdom','PubSub', 'jquery-contextMenu', 'app/DTFileList', 'app/DecTable'],
  function ($, React, ReactDOM, PubSub, contextmenu, DTFileList, DecTable) {

    function render() {
      ReactDOM.render( <
        DTFileList / >,
        document.getElementById('file-list-container')
      );
      ReactDOM.render( <
        DecTable / >,
        document.getElementById('decTableID')
      );
    }
    render();
    console.log("updated workspace.js");

  }); //require
