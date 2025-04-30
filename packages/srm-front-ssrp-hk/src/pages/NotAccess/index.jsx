import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const commonPrompt = 'spcm.erp';

@formatterCollections({ code: [commonPrompt] })
export default class NotAccess extends PureComponent {
  render() {
    return (
      <PageHeaderWrapper
        title={intl.get(`${commonPrompt}.view.not.authorized.access`).d('无权限访问,请联系管理员')}
      >
        <h1>
          {intl.get(`${commonPrompt}.view.not.authorized.access`).d('无权限访问,请联系管理员')}
        </h1>
      </PageHeaderWrapper>
    );
  }
}
