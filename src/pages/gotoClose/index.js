import React from 'react';
import qs from 'querystring';

export default class Test extends React.PureComponent {
  constructor(props) {
    super(props);
    console.log('test success load inner page');
    const routerParam = qs.parse(props.history.location.search.substr(1));
    console.log('inner page params', routerParam);
    this.init(routerParam);
  }

  init(routerParam) {
    window.parent.postMessage(
      {
        routerParam,
      },
      '*',
    );
  }

  render() {
    return <div />;
  }
}
