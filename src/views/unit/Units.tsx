import { useState } from 'react';
import { Unit, UnitForCreate } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import UnitDg from './UnitDg';
import "./Units.pcss";



function Units(){

  const [items, setItems] = useState([] as Unit[]);
  const [showEditDg, setShowEditDg] = useState(false);

  function refresh() {
    unitFmc.listUnits().then((result) => {
      setItems(result);
    });
  }

  function add() {
    // setShowEditDg(true);
    unitFmc.create({
      name: "测试", 
      is_lunar: false, 
      last_bidded_date: '2020-02-02T00:00:00.000Z', 
      day: 3, 
      cycle: 1, 
      budget: 1000, 
      count: 20, 
      bidded_count:  0, 
      unit_count: 1
    }).then(()=>{
      refresh();
    });
  }

  async function onSave(u: UnitForCreate) {
    await unitFmc.create(u);
    setShowEditDg(false);
  }

  async function onCancel() {
    setShowEditDg(false);
  }

  refresh();
  
  return (
    <div className="Units screen">
      {showEditDg && <UnitDg onSave={(d: UnitForCreate) => onSave(d)} onCancel={onCancel} />}
      <div className="screen-header">
        <button className="action-item" onClick={add}>添加</button>
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