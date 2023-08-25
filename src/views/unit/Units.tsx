import { useModal } from '@ebay/nice-modal-react';
import { Button, Table } from 'antd';
import { useCallback, useState } from 'react';
import { Unit, UnitForCreate } from '../../bindings';
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
  const add = useCallback(() => {
    unitModal.show({  }).then(() => {
      // do something if the task in the modal finished.
    });
  }, [unitModal]);

  async function onSave(u: UnitForCreate) {
    await unitFmc.create(u);
  }

  async function onCancel() {
  }

  refresh();

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
    }
  ];
  
  
  return (
    <div className="Units screen">
      <div className="screen-main">
        <div className="screen-table-actions">
          <Button className="action-item" onClick={add}>添加</Button>
        </div>
        <Table className="screen-table" columns={columns} dataSource={items ?? {}} pagination={false} />
      </div>
    </div>
  )
}

export default Units;