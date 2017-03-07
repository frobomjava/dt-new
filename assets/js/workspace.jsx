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

require(['jquery', 'react', 'reactdom','PubSub', 'jquery-contextMenu', 'classnames', 'app/projectExplorer', 'app/DecisionTable'],
function ($, React, ReactDOM, PubSub, contextmenu, classnames, ProjectExplorer, DecisionTable) {

  function render() {
    ReactDOM.render( <ProjectExplorer />,
      document.getElementById('project-explorer')
    );
    ReactDOM.render( <DecisionTable / >,
      document.getElementById('editor')
    );
  }
  render();
  console.log("updated workspace.js");

}); //require
