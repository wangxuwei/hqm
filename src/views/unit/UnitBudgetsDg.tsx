import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Button, Modal, Space } from 'antd';
import { useEffect, useState } from 'react';
import { Unit, UnitBudget } from '../../bindings';
import { unitBudgetFmc } from '../../model/fmc-unit-budget';
import { antdModal } from '../../ts/nice-modal-fix';
import ScrollTable from '../comp/ScrollTable';
import UnitBudgetDg from './UnitBudgetDg';
import "./UnitBudgetsDg.pcss";


function UnitBudgetsDg({ unit }: {unit:Unit}){
  const modal = useModal();

  const [items, setItems] = useState([] as UnitBudget[]);

  function refresh() {
    unitBudgetFmc.listUnitBudgets(unit.id).then((result) => {
      setItems(result);
    });
  }

  const unitBudgetModal = useModal(UnitBudgetDg);

  async function onAdd(){
    unitBudgetModal.show({ unit }).then(() => {
      refresh();
    });
  }

  async function onEdit(unitBudget:UnitBudget){
    unitBudgetModal.show({ unit,unitBudget }).then(() => {
      refresh();
    });
  }

  async function onDel(unitBudget:UnitBudget){
    await unitBudgetFmc.delete(unitBudget.id);
    refresh();
  }

  useEffect(() => {
    refresh();
  }, [setItems]);

  const columns = [
    {
      title: '自己',
      dataIndex: 'is_self',
    },
    {
      title: '标金',
      dataIndex: 'budget',
    },
    {
      title: '日期',
      dataIndex: 'budget_date',
    },
    {
      title: '操作',
      key: 'action',
      render: (_:any, rec:UnitBudget) => (
        <Space size="middle">
          <Button size='small' type="primary" onClick={() => onEdit(rec)}>修改</Button>
          <Button size='small' danger onClick={() => onDel(rec)}>删除</Button>
        </Space>
      ),
    },
  ];
  
  const data = (items ?? []).map((item:any) => {
    return {...item, key: item.id};
  });
  return (
    <Modal
      {...antdModal(modal)}
      title="竞标信息"
      className="UnitBudgetsDg"
      centered={true}
      footer={[
        <Button key="cancel" onClick={()=> {modal.hide()}}>关闭</Button>
      ]}
    >
      <div className="screen table-screen">
        <div className="screen-main">
          <div className="screen-table-actions">
            <Button className="action-item" onClick={onAdd}>添加</Button>
          </div>
          <ScrollTable className="screen-table" columns={columns} dataSource={data} pagination={false} />
        </div>
      </div>
    </Modal>
  )
}

export default NiceModal.create(UnitBudgetsDg);