import { useModal } from '@ebay/nice-modal-react';
import { open } from '@tauri-apps/api/dialog';
import { Button, Space, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import UnitDg from './UnitDg';

import "./Units.pcss";



function Units(){

  const [items, setItems] = useState([] as Unit[]);

  function refresh() {
    unitFmc.listUnits().then((result) => {
      setItems(result);
    });
  }

  const unitModal = useModal(UnitDg);

  async function onAdd(){
    unitModal.show({  }).then(() => {
      refresh();
    });
  }

  async function onPreImport(){
    const selected = await open({
      filters: [{
        name: 'json',
        extensions: ['json']
      }]
    });
    if (selected && !Array.isArray(selected)) {
      await unitFmc.importUnits(selected);
      refresh();
    }
  }

  async function onExport(){
  }

  async function onSync(){
  }

  async function onEdit(id:string){
    const unit = await unitFmc.get(id);
    unitModal.show({ unit }).then(() => {
      refresh();
    });
  }

  async function onDel(id:string){
    await unitFmc.delete(id);
    refresh();
  }

  useEffect(() => {
    refresh();
  }, [setItems]);

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '标金',
      dataIndex: 'budget',
    },
    {
      title: '支数',
      dataIndex: 'unit_count',
    },
    {
      title: '操作',
      key: 'action',
      render: (_:any, rec:{id:string}) => (
        <Space size="middle">
          <Button size='small' type="primary" onClick={() => onEdit(rec.id)}>修改</Button>
          <Button size='small' danger onClick={() => onDel(rec.id)}>删除</Button>
        </Space>
      ),
    },
  ];
  
  const data = (items ?? []).map((item:any) => {
    return {...item, key: item.id};
  });
  return (
    <div className="Units screen">
      <div className="screen-main">
        <div className="screen-table-actions">
          <Button className="action-item" onClick={onAdd}>添加</Button>
          <Button className="action-item" onClick={onPreImport}>导入</Button>
          <Button className="action-item" onClick={onExport}>导出</Button>
          <Button className="action-item" onClick={onSync}>同步</Button>
        </div>
        <Table className="screen-table" columns={columns} dataSource={data} pagination={false} />
      </div>
    </div>
  )
}

export default Units;