import { Button, Form } from 'antd';
import { useEffect, useState } from 'react';
import { DueDateSnapShot } from '../../bindings/DueDateSnapShot';
import { unitFmc } from '../../model/fmc-unit';
import { date, formatDate, now, toRFCString } from '../../ts/utils-date';
import LunarDatePicker from '../comp/LunarDatePicker';
import ScrollTable from '../comp/ScrollTable';
import "./StatsDueDate.pcss";

export default function StatsDueDate() {

  const [startDate, setStartDate] = useState(now());
  const [endDate, setEndDate] = useState(now().add(1, "years").month(0).date(0));
  const [items, setItems] = useState([] as DueDateSnapShot[]);

  function refresh() {
    unitFmc.getDueDateUnitsInPeroid(toRFCString(startDate), toRFCString(endDate)).then((result) => {
      setItems(result.unit_snapshots);
    });
  }

  useEffect(() => {
    refresh();
  }, [setItems]);


  const columns = [
    {
      title: '名称',
      dataIndex: ['unit', 'name']
    },
    {
      title: '标金',
      dataIndex: ['unit', 'budget']
    },
    {
      title: '支数',
      dataIndex: ['unit', 'unit_count']
    },
    {
      title: '结束时间',
      key: 'last_budget_date',
      render: (_:string, r:DueDateSnapShot) => {
        return formatDate(date(r.last_budget_date), "YYYY-MM-DD");
      }
    }
  ];
  
  return (
    <div className="StatsDueDate">
      <Form className="screen-filter" initialValues={{
        startDate,
        endDate
      }}>
      <Form.Item className="filter-item" name="startDate" label="开始时间：">
        <LunarDatePicker onChange={(e) => {setStartDate(e!)}} />
      </Form.Item>
      <Form.Item className="filter-item" name="endDate" label="结束时间：">
        <LunarDatePicker onChange={(e) => {setEndDate(e!)}} />
      </Form.Item>
        <Button className="filter-item" onClick={refresh}>查询</Button>
      </Form>

      <ScrollTable scroll={{y: 10}} rowKey={(r) => r.unit.id} className="screen-table" columns={columns} dataSource={items} pagination={false}/>
    </div>
  )
}