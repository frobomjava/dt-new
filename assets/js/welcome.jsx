requirejs.config({
  paths: {
    'react': '/bower_components/react/react-with-addons',
    'reactdom': '/bower_components/react/react-dom',
    'jquery': '/bower_components/jquery/dist/jquery',
    'jquery.ui': '/bower_components/jquery-ui/jquery-ui',
    'classnames': '/bower_components/classnames/index',
    'bootstrap': '/bower_components/bootstrap/dist/js/bootstrap',
    'app': '/js'
  },

  shim: {
    'jquery.ui': ["jquery"],
    'bootstrap': ["jquery"],
  }

});

require(['jquery', 'react', 'reactdom', 'app/ProjectList'],
  function ($, React, ReactDOM, ProjectList) {

    function render() {
      ReactDOM.render( <
        ProjectList / > ,
        document.getElementById('projects')
      );
    }

    render();
    console.log("updated welcome.js");

  }); //require
