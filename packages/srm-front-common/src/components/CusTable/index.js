import React from 'react';
import { Resizable } from 'react-resizable';
import { isEqual } from 'lodash';
import { Table } from 'antd';
import { filterNullValueObject, setSession, getSession } from 'utils/utils';
import CusPagination from '@/components/CusPagination';
import { tableScrollWidth } from '@/utils/utils';
import { Scrollbars } from 'react-custom-scrollbars';
import './index.less';
import intl from 'utils/intl';
import { fastCodeLoader } from '@/utils/decorators';
import { queryIdpValue } from 'hzero-front/lib/services/api';

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  if (!width) {
    return <th {...restProps} />;
  }
  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{
        enableUserSelectHack: false,
      }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

export default class CusTable extends React.PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef && onRef(this);

    this.state = {
      columns: props.columns,
      selfPagination: props.pagination || {}, // 组件自身分页属性，初始化为props传递下来的值
      id: `table${Math.floor(Math.random() * 10000 + 1)}`,
      tableWidthData: 0,
    };
  }

  scrollBar = React.createRef();

  // 计算动态分配列宽
  componentDidMount() {
    window.addEventListener('resize', this.handleTableWidth);
    this.handleTableWidth();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { columns = [], pagination } = this.props;
    const { columns: prevColumns = [], pagination: prevPagination } = prevProps;
    // 若props传入的pagination变化时，需要更新selfPagination
    if (!isEqual(pagination, prevPagination)) {
      this.setState({
        selfPagination: pagination,
      });
    }

    if (!isEqual(columns, prevColumns)) {
      const filterHiddenColumns = columns.filter((col) => !col.hidden);
      const prevTotalWidth = this.getTotalWidth(prevColumns);
      const totalWidth = this.getTotalWidth(columns);
      // 当两次columns的宽度总和不相等时，重新计算宽度
      if (totalWidth !== prevTotalWidth) {
        this.handleTableWidth(true);
      } else {
        this.setState({
          columns: filterHiddenColumns.map((c) => {
            // columns更新时width取state计算过的数值
            const width = this.state.columns.find((w) => w.dataIndex === c.dataIndex)?.width;
            return {
              ...c,
              width: width || c.width,
            };
          }),
        });
      }
    }
  }

  getTotalWidth = (columns = []) => {
    const filterHiddenColumns = columns.filter((col) => !col.hidden) || [];
    return filterHiddenColumns.reduce((sum, column) => sum + column.width, 0);
  };

  /**
   * @name: 计算表格列宽
   * @param {boolean} flag 强制执行标识
   */
  handleTableWidth = async (flag = false) => {
    const { id, tableWidthData } = this.state;
    const { columns: prevColumns } = this.props;
    // 过滤掉隐藏的列
    const columns = prevColumns.filter((col) => !col.hidden);

    let fieldWidthSum = 0; // 字段宽度总和
    columns.map((list) => {
      fieldWidthSum += list.width;
      return list;
    });

    // 判断table展示宽度
    const table = document.querySelector(`#${id}`);
    if (table && (tableWidthData !== table.offsetWidth || flag)) {
      const tableWidth = table.offsetWidth;
      this.setState({ tableWidthData: tableWidth });
      let lovData = [];
      if (getSession('lockColumnWidthField')) {
        lovData = getSession('lockColumnWidthField');
      } else {
        lovData = await queryIdpValue('HTBL.TABLE_LOCK_COLUMN_WIDTH');
        if (lovData) {
          setSession('lockColumnWidthField', lovData);
        }
      }
      if (tableWidth > 0 && lovData) {
        let shareNum = 0; // 列分配个数
        let data = []; // 存放新列数据
        const lockColNameArr = []; // 匹配固定列宽-dataIndex
        const lockColTitleArr = []; // 匹配固定列宽-title
        lovData.map((list) => {
          lockColNameArr.push(list.value);
          lockColTitleArr.push(list.description);
          lockColTitleArr.push(list.meaning);
          return list;
        });

        columns.map((list) => {
          if (!(lockColNameArr.includes(list.dataIndex) || lockColTitleArr.includes(list.title))) {
            shareNum++;
          }
          return list;
        });

        if (fieldWidthSum < tableWidth) {
          data = columns.map((list) => {
            if (
              !(lockColNameArr.includes(list.dataIndex) || lockColTitleArr.includes(list.title))
            ) {
              return {
                ...list,
                width: list.width + (tableWidth - fieldWidthSum - 60) / shareNum,
              };
            }
            return list;
          });
          this.setState({
            columns: columns.map((list, index) => {
              return {
                ...list,
                width: data[index].width,
              };
            }),
          });
        } else {
          this.setState({
            columns: columns.map((c) => {
              // columns更新时width取state计算过的数值
              const width = this.state.columns.find((w) => w.dataIndex === c.dataIndex)?.width;
              return {
                ...c,
                width: width || c.width,
              };
            }),
          });
        }
      }
    }
  };

  /**
   * 处理拖拽
   * @param dataIndex
   * @returns {function(...[*]=)}
   */
  handleResize =
    (dataIndex) =>
    (_, { size }) => {
      const recursiveUpdateColumn = (Cols, isFound = false) => {
        const newCols = [];
        for (const col of Cols) {
          if (isFound) {
            newCols.push({ ...col });
            continue;
          }
          if (col.dataIndex === dataIndex) {
            newCols.push({
              ...col,
              width: size.width,
            });
            isFound = true;
          } else if (col.children && Array.isArray(col.children)) {
            col.children = recursiveUpdateColumn(col.children, isFound);
            newCols.push(col);
          } else {
            newCols.push({ ...col });
          }
        }
        return newCols;
      };

      this.setState(({ columns }) => {
        const nextColumns = [...columns];
        return { columns: recursiveUpdateColumn(nextColumns) };
      });
    };

  /**
   * 字段必填时，增加必填*号
   * @param col
   * @returns {*}
   */
  renderTitle = (col = {}) => {
    const { title } = col;
    return col.required ? (
      <span
        className="cus-required-header"
        {...{ title: typeof title === 'string' && title }}
      >
        {/* <span style={{ color: '#F54A45', marginRight: '4px' }}>*</span> */}
        {title}
      </span>
    ) : (
      title
    );
  };

  /**
   * 将最后一列的宽度置空，适应屏幕的放大。表格不进行等比扩大
   * @param columns
   * @param ellipsis
   * @returns {[]}
   */
  getMergeColumns = (columns, ellipsis) => {
    const recursive = (cols) => {
      const resultColumns = [];
      cols.forEach((col) => {
        const { className, onHeaderCell, ...otherCol } = col;
        const title = this.renderTitle(col);
        const newCol = {
          ellipsis,
          className: isEqual(cols, columns) ? className : `${className} cus-table-tr-th-border`,
          ...otherCol,
          title,
          children: col.children ? recursive(col.children) : null,
          onHeaderCell: (column) => {
            const externalHeaderCell =
              typeof onHeaderCell === 'function' ? onHeaderCell(column) : {};
            return {
              ...externalHeaderCell, // 调用外部传递的 onHeaderCell 方法并合并结果，如果没有则默认为空对象
              width: column.width,
              onResize: this.handleResize(column.dataIndex),
            };
          },
        };
        resultColumns.push(filterNullValueObject(newCol));
      });
      return resultColumns;
    };
    return recursive(columns, ellipsis);
  };

  /**
   * 滚动条渲染函数
   * @param className
   * @returns {function({style: *, props: *}): *}
   */
  getScrollBarFn = (className) => {
    return ({ style, props }) => (
      <div {...props} style={{ ...style, opacity: 1 }} className={className} />
    );
  };

  /**
   * 更新滚动条透明度
   * @param {number} value[0|1] 透明度
   */
  updateScrollOpacity = (value) => {
    if (this.scrollBar) {
      this.scrollBar.thumbHorizontal.style.opacity = value;
      this.scrollBar.thumbVertical.style.opacity = value;
      this.scrollBar.trackHorizontal.style.opacity = value;
      this.scrollBar.trackVertical.style.opacity = value;
    }
  };

  /**
   * 分页器变更
   * @param pagination 分页属性
   */
  handlePageChange = (pagination) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination);
    }
    this.setState({
      selfPagination: pagination,
    });
  };

  /**
   * 本地分页，根据分页属性截取数据
   * @param originData 原始数据源
   * @param selfPagination 自身分页属性
   * @returns {*}
   */
  getDataSource = (originData, selfPagination) => {
    const { pagination } = this.props
    // 该方法是在render中调用的，而selfPagination在componentDidUpdate更新后数据才正确，第一次render数据是错误的，故这里使用props的pagination进行判断
    if(originData.length <= pagination.pageSize){
      return originData;
    }
    const startIndex = ((selfPagination.current || 1) - 1) * selfPagination.pageSize;
    const endIndex = startIndex + selfPagination.pageSize;
    return originData.slice(startIndex, endIndex);
  };

  /**
   * 水平滚动到某一个位置
   * @param position 滚动的位置
   * @param offset 偏移量
   * @returns {*}
   */
  scrollToPosition = (position = 0, offset = 0) => {
    const { ellipsis = true } = this.props;
    if (this.scrollBar) {
      // 计算滚动区域宽度
      const scrollColumns = this.state?.columns.map((col, index) => {
        if (index === this.state?.columns.length - 1) {
          return {
            ellipsis,
            ...col,
          };
        }
        return {
          ellipsis,
          ...col,
          onHeaderCell: (column) => ({
            width: column.width,
            onResize: this.handleResize(index),
          }),
        };
      });
      const left = (tableScrollWidth(scrollColumns.slice(0, position)) || 0) + offset;
      this.scrollBar.scrollLeft(left);
    }
  };

  render() {
    const {
      rowSelection,
      dataSource: originData = [],
      pagination = {},
      ellipsis = true,
      onChange = (e) => e,
      paddingLeft = 0,
      showSorterTooltip = false,
      scroll = {},
      components,
      ...otherProps
    } = this.props;
    const { selfPagination, id } = this.state;
    // 是否本地分页，根据传入的数组长度等于分页属性的总条数时
    const isLocalPaging = originData.length === pagination.total;
    // 集成可列宽可拖拽
    const mergeColumns = this.getMergeColumns(this.state?.columns, ellipsis);
    // 计算滚动区域宽度
    const scrollColumns = this.state?.columns.map((col, index) => {
      if (index === this.state?.columns.length - 1) {
        return {
          ellipsis,
          ...col,
        };
      }
      return {
        ellipsis,
        ...col,
        onHeaderCell: (column) => ({
          width: column.width,
          onResize: this.handleResize(index),
        }),
      };
    });
    const { y } = scroll;
    const tableProps = {
      ...otherProps,
      onChange,
      showSorterTooltip,
      dataSource: isLocalPaging ? this.getDataSource(originData, selfPagination) : originData,
      pagination: false,
      bordered: false,
      columns: mergeColumns,
      scroll: { x: tableScrollWidth(scrollColumns) },
      rowSelection: rowSelection
        ? {
            ...rowSelection,
            columnWidth: 48,
          }
        : null,
      components: {
        header: {
          cell: ResizableTitle,
        },
        ...components,
      },
      locale: {
        emptyText: intl.get('hzero.common.components.noticeIcon.null').d('暂无数据'), // 自定义无数据时显示的文本
      },
    };

    return (
      <>
        <div
          className="customize-table"
          style={{ paddingLeft }}
          // onMouseEnter={() => this.updateScrollOpacity(1)}
          // onMouseLeave={() => this.updateScrollOpacity(0)}
          id={id}
        >
          <Scrollbars
            ref={(node) => {
              this.scrollBar = node;
            }}
            className={y ? '' : 'scrollbars-custom'}
            universal
            autoHeight
            autoHeightMin={0}
            autoHeightMax={y || 100000}
            renderTrackHorizontal={this.getScrollBarFn('track-horizontal')}
            renderTrackVertical={this.getScrollBarFn('track-vertical')}
            renderThumbHorizontal={this.getScrollBarFn('thumb-horizontal')}
            renderThumbVertical={this.getScrollBarFn('thumb-vertical')}
          >
            <Table {...tableProps} />
          </Scrollbars>
        </div>
        {pagination && (
          <CusPagination
            {...(isLocalPaging ? selfPagination : pagination)}
            onChange={this.handlePageChange}
          />
        )}
      </>
    );
  }
}
