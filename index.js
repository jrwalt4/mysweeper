requirejs.config({
  baseUrl: '.',
  paths: {
    'react': 'vendor/react',
    'react-dom': 'vendor/react-dom'
  }
});

requirejs(['react','react-dom','./src/App'], function(React, ReactDOM, App) {
  ReactDOM.render(React.createElement(App), document.getElementById('root'));
});
