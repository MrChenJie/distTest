import React from 'react';
import { configure } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';

import { totalRender } from 'utils/renderer';
import intl from 'utils/intl';

function pagerRenderer(page, type) {
  switch (type) {
    case 'first':
      return null;
    case 'last':
      return null;
    case 'prev':
      return <Icon type='navigate_before' />;
    case 'next':
      return <Icon type='navigate_next' />;
    case 'jump-prev':
    case 'jump-next':
      return '\u2022\u2022\u2022';
    default:
      return page;
  }
}

function sizeChangerRenderer({ text }) {
  return intl.get('hzero.common.pagination.size.change', { size: text }).d(`${text} 条/页`);
}

const tablePaginationConfig = {
  showSizeChangerLabel: false,
  showPager: true,
  showQuickJumper: false,
  sizeChangerPosition: 'right',
  itemRender: pagerRenderer,
  showTotal: totalRender,
  sizeChangerOptionRenderer: sizeChangerRenderer,
};

export default () => {
  configure({
    pagination: tablePaginationConfig,
  });
};
