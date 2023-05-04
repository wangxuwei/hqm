import { Moment } from 'moment';
import { useState } from 'react';
import { Unit } from '../../ts/entity-types';
import { getDueDateUnitsInPeroid } from '../../ts/service-unit';
import { formatDate, mom, now } from '../../ts/utils-date';
import "./StatsDueDate.pcss";

export default function StatsDueDate(){
  
  const [startDate, setStartDate] = useState(now());
  const [endDate, setEndDate] = useState(now().add(1, "years").month(0).date(0));
  const [items, setItems] = useState([] as ({unit:Unit ,lastBudgetDate:Moment})[]);


  function refresh(){
    getDueDateUnitsInPeroid(startDate, endDate).then((result) => {
      setItems(result.unitSnapshots);
    });
  }
  
  refresh();

  return (
    <div className="StatsDueDate section">
      <div className="section-filter">
        <div className="filter-item">
          <span>开始时间：</span>
          <div className="date-input">
            <input name="startDate" value={formatDate(startDate)} onChange={(e) => setStartDate(mom(e.target.value))}/>
          </div>
        </div>
        <div className="filter-item">
          <span>结束时间：</span>
          <div className="date-input">
            <input name="endDate" value={formatDate(endDate)} onChange={(e) => setEndDate(mom(e.target.value))}/>
          </div>
        </div>
        <div className="filter-item">
          <button className="search" onClick={refresh}>查询</button>
        </div>
      </div>
      <div className="section-results">
        <div className="table">
          <div className="thead">
            <div className="tr">
              <div className="td">名称</div>
              <div className="td">标金</div>
              <div className="td">支数</div>
              <div className="td">结束时间</div>
            </div>
          </div>
          <div className="tbody">
              {
                items.map((r, i) => {
                  const unit = r.unit;
                  return (
                  <div className="tr" key={i}>
                    <div className="td">{unit.name}</div>
                    <div className="td">{unit.budget}</div>
                    <div className="td">{unit.unitCount}</div>
                    <div className="td">{formatDate(r.lastBudgetDate) }</div>
                  </div>
                )})
              }
          </div>
        </div>
      </div>
    </div>
  )
}