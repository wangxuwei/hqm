import moment from 'moment';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import { now } from '../../ts/utils-date';
import LunarDatePicker from '../comp/LunarDatePicker';
import "./StatsDueDate.pcss";

export default function StatsDueDate() {

  const [startDate, setStartDate] = useState(now());
  const [endDate, setEndDate] = useState(now().add(1, "years").month(0).date(0));
  const [items, setItems] = useState([] as ({ unit: Unit, last_budget_date: string })[]);

  function refresh() {
    unitFmc.getDueDateUnitsInPeroid(startDate.toISOString(), endDate.toISOString()).then((result) => {
      setItems(result.unit_snapshots);
    });
  }

  useEffect(() => {
    refresh();
  }, [setItems]);

  return (
    <div className="StatsDueDate section">
      <div className="section-filter">
        <div className="filter-item">
          <span>开始时间：</span>
          <div className="date-input">
            <LunarDatePicker onChange={(e) => {setStartDate(moment(e?.toISOString()))}}/>
          </div>
        </div>
        <div className="filter-item">
          <span>结束时间：</span>
          <div className="date-input">
            <LunarDatePicker onChange={(e) => {setEndDate(moment(e?.toISOString()))}}/>
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
                    <div className="td">{unit.budget.toString()}</div>
                    <div className="td">{unit.unit_count.toString()}</div>
                    <div className="td">{r.last_budget_date}</div>
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