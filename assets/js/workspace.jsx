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

require(['react','reactdom','app/ProjectExplorer', 'app/DecisionTable', 'app/ProjectLog', 'app/EditorStatusbar'],
function (React, ReactDOM, ProjectExplorer, DecisionTable, ProjectLog, EditorStatusbar) {

  function render() {
    ReactDOM.render( <ProjectExplorer />,
      document.getElementById('project-explorer')
    );
    ReactDOM.render( <DecisionTable / >,
      document.getElementById('editor')
    );
    ReactDOM.render( <ProjectLog />,
      document.getElementById('activity-container')
    );
    ReactDOM.render( <EditorStatusbar />,
      document.getElementById('editor-status-bar')
    );
  }
  render();
  console.log("updated workspace.js>>>> require order 2");

}); //require
