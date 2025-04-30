import React from 'react';
import { Link } from 'react-router-dom';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import { tooltipRender, labelTip } from '_cus_utils/render';
import { createPagination } from 'utils/utils';
import CusTable from '_cus_components/CusTable';

const prompt = 'spfmhk.supplier';

export default class DraftAttachmentTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
    }
  }

  componentDidMount() {

  }

  render() {
    const { rowSelection, onChange } = this.props;
    const { dataSource, pagination } = this.state;
    const columns = [
      {
        title: intl.get(`${prompt}.attachment.info.type`).d('附件类型'),
      },
      {
        title: intl.get(`${prompt}.attachment.info.description`).d('附件描述'),
      },
      {
        title: intl.get(`${prompt}.attachment.info.file.expiration.date`).d('文件到期日'),
      },
      {
        title: intl.get(`${prompt}.attachment.info.last.update.time`).d('最后更新时间'),
      },
      {
        title: intl.get(`${prompt}.attachment.info.upload`).d('附件上传'),
      },
    ];
    return (
      <>
        <CusTable
          rowKey="resultId"
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
