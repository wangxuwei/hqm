import { useModal } from '@ebay/nice-modal-react';
import { Button } from 'antd';
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
  
  return (
    <div className="Units screen">
      <div className="screen-header">
        <Button className="action-item" onClick={add}>添加</Button>
      </div>
      <div className="screen-main">
        <div className="table">
          <div className="thead">
            <div className="tr">
              <div className="td">名称</div>
              <div className="td">标金</div>
              <div className="td">支数</div>
            </div>
          </div>
          <div className="tbody">
            {
              items.map((r) => {
                const unit = r;
                return (
                  <div className="tr" key={unit.id}>
                    <div className="td">{unit.name}</div>
                    <div className="td">{unit.budget.toString()}</div>
                    <div className="td">{unit.unit_count.toString()}</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Units;