import { Button, Form, Table } from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { PaymentSnapShot } from '../../bindings/PaymentSnapShot';
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

  const columns = [
    {
      title: '时间',
      key: 'time',
      render: (_:string, r:PaymentSnapShot) => {
          const unit = r.unit;
          const date = dateObj(r.date);
          let day = date.date();
          if(unit.is_lunar){
            const lunarDate = solar2lunar(date);
            day = lunarDate.day;
          }
        return `${formatDate (date)} (${formatLunarDate (date)}) ${day !== unit.day ? "(加标)":""}`
      }
    },
    {
      title: '名称',
      dataIndex: ['unit', 'name']
    },
    {
      title: '标金',
      key: 'budget',
      render: (_:string, r:PaymentSnapShot) => {
        const unit = r.unit;
        return unit.budget.toString();
      }
    },
    {
      title: '支数',
      key: 'unit_count',
      render: (_:string, r:PaymentSnapShot) => {
        const unit = r.unit;
        return unit.unit_count.toString();
      }
    },
    {
      title: '支付金额',
      dataIndex: 'payment'
    },
    {
      title: '进度',
      key: 'progress',
      render: (_:string, r:PaymentSnapShot) => {
        const unit = r.unit;
        return `${r.number} / ${unit.count.toString()}`
      }
    },
  ];

  return (
    <div className="StatsPayment screen">
      <Form className="screen-filter" initialValues={{
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

      <Table className="screen-table" columns={columns} dataSource={items} pagination={false} 
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6} align='right'>总支出: {total}</Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}/>
    </div>
  )
}