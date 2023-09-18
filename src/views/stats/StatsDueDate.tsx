import { Button, Form, Table } from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { DueDateSnapShot } from '../../bindings/DueDateSnapShot';
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


  const columns = [
    {
      title: '名称',
      dataIndex: ['unit', 'name']
    },
    {
      title: '标金',
      key: 'budget',
      render: (_:string, r:DueDateSnapShot) => {
        const unit = r.unit;
        return unit.budget.toString();
      }
    },
    {
      title: '支数',
      key: 'unit_count',
      render: (_:string, r:DueDateSnapShot) => {
        const unit = r.unit;
        return unit.unit_count.toString();
      }
    },
    {
      title: '结束时间',
      key: 'last_budget_date',
    }
  ];
  
  return (
    <div className="StatsDueDate">
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
        <Button className="filter-item" onClick={refresh}>查询</Button>
      </Form>

      <Table className="screen-table" columns={columns} dataSource={items} pagination={false}/>
    </div>
  )
}