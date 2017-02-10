requirejs.config({
  paths: {
    'react': '/bower_components/react/react-with-addons',
    'reactdom': '/bower_components/react/react-dom',
    'jquery': '/bower_components/jquery/dist/jquery',
    'jquery.ui': '/bower_components/jquery-ui/jquery-ui',
    'bootstrap': '/bower_components/bootstrap/dist/js/bootstrap',
    'app': '/js',
    'typeahead': '/bower_components/typeaheadjs/dist/typeahead.jquery.min',
    'bloodhound' : '/bower_components/typeaheadjs/dist/bloodhound.min'
  },

  shim: {
    'jquery.ui': ["jquery"],
    'bootstrap': ["jquery"],
    typeahead:{
      deps: ['jquery'],
      init: function ($) {
          return require.s.contexts._.registry['typeahead.js'].factory( $ );
      }
    },
    bloodhound: {
       deps: ['jquery'],
       exports: 'Bloodhound'
    }
  }

});

require(['jquery', 'react', 'reactdom', 'typeahead', 'bloodhound', 'app/MemberList', 'bootstrap'],
function ($, React, ReactDOM, typeahead, Bloodhound, MemberList) {

  $(document).ready(function() {

    var users = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('userName'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: '../../users',
      remote: {
        url: '../../users/%QUERY',
        wildcard: '%QUERY'
      }
    });

    $('#remote .typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'userName',
      display: 'userName',
      source: users,
      templates: {
        empty: [
          '<div class="noitems">',
          'No Users Found',
          '</div>'
        ].join('\n')
      }
    });

    console.log('projectName : ' + projectName);

    $('input').on([
      'typeahead:initialized',
      'typeahead:initialized:err',
      'typeahead:selected',
      'typeahead:autocompleted',
      'typeahead:cursorchanged',
      'typeahead:opened',
      'typeahead:closed'
    ].join(' '), function(x) {
      console.log("this.value : " + this.value);
    });

    $(document).on('mouseenter', 'div.list-group-item', function(event){
       $(event.target).children(".member-delete").show();
    });

    $(document).on('mouseleave', 'div.list-group-item', function(){
      $('div.member-delete').hide();
    });

    function render() {
      ReactDOM.render( <MemberList />,
        document.getElementById('memberlist')
      );
    }
    render();
    });


  console.log("updated setting.js");

}); //require
