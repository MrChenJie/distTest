import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { Form } from 'hzero-ui';
import { tooltipRender } from '_cus_utils/render';
import CusButton from '_cus_components/CusButton';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './index.less';

const prompt = 'spfmhk.mylink';
@Form.create()
export default class DetailList extends PureComponent {
  constructor(props) {
    super(props);
    this.searchInput = React.createRef();
    this.state = {
      searchText: '',
      searchedColumn: '',
    };
  }

  componentDidMount() {}

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{padding: 8}}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={this.searchInput}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <div style={{textAlign: 'right'}}>
          <CusButton
            mini
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            style={{marginLeft: 0}}
          >
            {intl.get('hzero.common.cusButton.query').d('查询')}
          </CusButton>
          <CusButton
            mini
            onClick={() => clearFilters && this.handleReset(clearFilters)}
          >
            {intl.get('hzero.common.cusButton.reset').d('重置')}
          </CusButton>
        </div>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#3271FE' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => this.searchInput.current?.select(), 100);
        }
      },
    },
  });

  render() {
    const { tabsTag, idpValueMap, partnerAssessmentSummaryModal } = this.props;
    const { judgesSource = [], partnerEvalItems = idpValueMap['LINK.PARTNER_EVAL_ITEM'] || [] } = partnerAssessmentSummaryModal;

    console.log('idp', idpValueMap['LINK.PARTNER_EVAL_ITEM']);
    const columns = [
      {
        title: intl.get(`${prompt}.field.partner.name`).d('合作伙伴名称'),
        dataIndex: 'partnerName',
        className: 'custom-filter-dropdown',
        width: 200,
        render: (_, record) => {
          return (
            tooltipRender(record?.partnerName)
          )
        },
        ...this.getColumnSearchProps('partnerName'),
      },
    ];

    const totalScoreColumns = [
      {
        title: intl.get(`${prompt}.field.total.score`).d('总分'),
        dataIndex: 'evalScoreSum',
        width: 160,
        sorter: (a, b) => a.evalScoreSum - b.evalScoreSum,
        sortDirections: ['ascend', 'descend'],
        render: (_, record) => {
          return (
            tooltipRender(record.evalScoreSum)
          )
        }
      },
      tabsTag === 'summary' && {
        title: intl.get(`${prompt}.field.level`).d('等级'),
        dataIndex: 'evalScoreGrade',
        width: 160,
        sorter: (a, b) => a.evalScoreGrade - b.evalScoreGrade,
        sortDirections: ['ascend', 'descend'],
        render: (_, record) => {
          return (
            tooltipRender(record.evalScoreGrade)
          )
        }
      }
    ].filter(Boolean);

    const newColumns = [
      ...columns, // 保留原来的列
      ...partnerEvalItems?.map(item => ({
        title: item.meaning,
        dataIndex: item.value,
        width: 120,
        sorter: (a, b) => a[item.value] - b[item.value],
        sortDirections: ['ascend', 'descend'],
        render: (_, record) => {
          return (
            tooltipRender(record?.[item.value])
          )
        }
      })),
      ...totalScoreColumns, // 总分列
    ];

    return (
      <>
        <CusTable
          rowKey="rowKey"
          pagination={false}
          columns={newColumns}
          dataSource={judgesSource}
          rowSelection={false}
          scroll={{ x: tableScrollWidth(columns), y: 440 }}
        />
      </>
    )
  }
}
