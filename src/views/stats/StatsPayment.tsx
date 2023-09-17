import { Button, Form } from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import { date as dateObj, formatDate, now, toRFCString } from '../../ts/utils-date';
import { formatLunarDate, solar2lunar } from '../../ts/utils-lunar';
import LunarDatePicker from '../comp/LunarDatePicker';
import "./StatsPayment.pcss";



export default function StatsPayment(){

  const [startDate, setStartDate] = useState(now());
  const [endDate, setEndDate] = useState(now().add(1, "months").date(0));
  const [items, setItems] = useState([] as {
    unit:Unit
    date: string,
    payment:number,
    number: number}[]);
  const [total, setTotal] = useState(0);

  function refresh(){
    unitFmc.getPaymentInPeriod(toRFCString(startDate), toRFCString(endDate)).then((result) => {
      setItems(result.unit_snapshots);
      setTotal(result.total_payment);
    });
  }

  function onSearch(){
    refresh();
  }

  useEffect(() => {
    refresh();
  }, [setItems]);
  return (
    <div className="StatsPayment section">
      <Form className="section-filter" initialValues={{
        startDate,
        endDate
      }}>
        <Form.Item className="filter-item" name="startDate" label="开始时间：">
          <LunarDatePicker onChange={(e:Dayjs) => {setStartDate(e!)}} />
        </Form.Item>
        <Form.Item className="filter-item" name="endDate" label="结束时间：">
          <LunarDatePicker onChange={(e:Dayjs) => {setEndDate(e!)}} />
        </Form.Item>
        <Button className="filter-item" onClick={onSearch}>查询</Button>
      </Form>
      <div className="section-results">
        <div className="table">
          <div className="thead">
            <div className="tr">
              <div className="td">时间</div>
              <div className="td">名称</div>
              <div className="td">标金</div>
              <div className="td">支数</div>
              <div className="td">支付金额</div>
              <div className="td">进度</div>
            </div>
          </div>
          <div className="tbody">
            {
              (items??[]).map((r, i) => {
                const unit = r.unit;
                const date = dateObj(r.date);
                let day = date.date();
                if(unit.is_lunar){
                  const lunarDate = solar2lunar(date);
                  day = lunarDate.day;
                }
                return (
                  <div className="tr" key={i}>
                    <div className="td">{formatDate (date)} ({formatLunarDate (date)}) {day !== unit.day ? "(加标)":""}</div>
                    <div className="td">{unit.name}</div>
                    <div className="td">{unit.budget.toString()}</div>
                    <div className="td">{unit.unit_count.toString()}</div>
                    <div className="td">{r.payment}</div>
                    <div className="td">{r.number} / {unit.count.toString()}</div>
                  </div>)
              })
            }
          </div>
          <div className="tfoot">总支出: {total}</div>
      </div>
    </div>
  </div>
  )
}