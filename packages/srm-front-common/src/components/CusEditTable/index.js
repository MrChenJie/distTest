import React, { useContext, useState, useEffect } from 'react';
import { Form, Table } from 'antd';
import { Resizable } from 'react-resizable';
import CusPagination from '@/components/CusPagination';
import './index.less';

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  const record = props.children[0]?.props.record || {};
  record.$form = form;
  if (record._status === 'create' || record._status === 'update') {
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  }
  return <tr {...props} />;
};

const EditableCell = ({ record, title, dataIndex, children, ...restProps }) => {
  const form = useContext(EditableContext);
  if (record?._status === 'create' || record?._status === 'update') {
    useEffect(() => {
      form.setFieldsValue({
        [dataIndex]: record?.[dataIndex],
      });
    }, []);
  }
  return <td {...restProps}>{children}</td>;
};

const ResizeableTitle = (props) => {
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

export default function EditTable({
  dataSource,
  columns,
  pagination,
  rowSelection,
  ellipsis = true,
  onChange = (e) => e,
  ...otherProps
}) {
  // 表格列
  const [cols, setCols] = useState(columns);
  const [newColumns, setNewColumns] = useState([]);

  // 处理拖拽
  const handleResize = (index) => (e, { size }) => {
    const nextColumns = [...cols];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    setCols(nextColumns);
  };

  useEffect(() => {
    setNewColumns(
      (cols || []).map((col, index) => ({
        ellipsis,
        ...col,
        onHeaderCell: (column) => ({
          width: column.width,
          onResize: handleResize(index),
        }),
        onCell: (record) => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
        }),
      }))
    );
  }, [cols]);

  const components = {
    header: {
      cell: ResizeableTitle,
    },
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const tableProps = {
    components,
    rowClassName: "customise-edit-table",
    onChange,
    dataSource,
    columns:newColumns,
    pagination: false,
    rowSelection: rowSelection ?
      {
        ...rowSelection,
        columnWidth: 48,
      } :
      null,
  }

  return (
    <div className="customize-table">
      <Table
        {...otherProps}
        {...tableProps}
      />
      <CusPagination {...pagination} onChange={onChange} />
    </div>
  );
}
