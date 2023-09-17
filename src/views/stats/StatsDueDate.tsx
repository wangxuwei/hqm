import { Button, Form } from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import { now, toRFCString } from '../../ts/utils-date';
import LunarDatePicker from '../comp/LunarDatePicker';
import "./StatsDueDate.pcss";

export default function StatsDueDate() {

  const [startDate, setStartDate] = useState(now());
  const [endDate, setEndDate] = useState(now().add(1, "years").month(0).date(0));
  const [items, setItems] = useState([] as ({ unit: Unit, last_budget_date: string })[]);

  function refresh() {
    unitFmc.getDueDateUnitsInPeroid(toRFCString(startDate), toRFCString(endDate)).then((result) => {
      setItems(result.unit_snapshots);
    });
  }

  useEffect(() => {
    refresh();
  }, [setItems]);

  return (
    <div className="StatsDueDate section">
      <Form className="section-filter">
        <Form.Item className="filter-item" name="day" label="开始时间：">
          <LunarDatePicker onChange={(e:Dayjs) => {setStartDate(e!)}}/>
        </Form.Item>
        <Form.Item className="filter-item" name="day" label="结束时间：">
          <LunarDatePicker onChange={(e:Dayjs) => {setEndDate(e!)}}/>
        </Form.Item>
        <Button className="filter-item" onClick={refresh}>查询</Button>
      </Form>
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