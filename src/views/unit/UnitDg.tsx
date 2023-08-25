import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { DatePicker, Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useCallback, useState } from 'react';
import { Unit } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import { antdModal } from '../../ts/nice-modal-fix';
import "./UnitDg.pcss";

export default NiceModal.create(({ unit }: { unit?: Unit }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const [plus, setPlus] = useState(false);
  // const meta = {
  //   initialValues: unit,
  //   fields: [
  //     { key: 'name', label: 'Name', required: true },
  //     { key: 'job', label: 'Job Title', required: true },
  //   ],
  // };

  const handleSubmit = useCallback(() => {
    form.validateFields().then(async () => {
      const newUnit = { ...form.getFieldsValue() };
      console.log(newUnit);
      await unitFmc.create(newUnit);
      modal.resolve(newUnit);
      modal.hide();
    }).catch((e) => {console.log(e)});
  }, [modal, unit, form]);

  const frequency = [
    { value: 1, label: '一月一次' },
    { value: 2, label: '两月一次' },
    { value: 3, label: '三月一次' },
    { value: 4, label: '四月一次' },
    { value: 5, label: '五月一次' },
    { value: 6, label: '六月一次' }
  ];

  const validateMessages = {
    required: '${label}是必填项!',
  }

  const lblBidedTxt = plus ? "加标" : "标会" ;
  return (
    <Modal
      {...antdModal(modal)}
      title={unit ? '会信息修改' : '添加会'}
      okText={unit ? '修改' : '添加'}
      onOk={handleSubmit}
      className='UnitDg'
    >
      <Form form={form}
        labelCol={{ span: 5 }}
        validateMessages={validateMessages}
        initialValues={{is_lunar:true, day: 1, plus_day: 1, cycle:1, plus_cycle: 1, count:10, bidded_count: 0, unit_count: 1}}>
        <Form.Item name="name" label="名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="is_lunar" label="类型" rules={[{ required: true }]}>
          <Select
            options={[
              { value: true, label: '农历' },
              { value: false, label: '新历' }
            ]}
          />
        </Form.Item>

        <Form.Item label="正标日" rules={[{ required: true }]}>
          <Form.Item name="day" label="正标日" rules={[{ required: true }]} noStyle>
            <InputNumber min={1} max={31} />
          </Form.Item>
          <span className="ant-form-text day-text">日</span>
        </Form.Item>

        <Form.Item name="cycle" label="正标周期" rules={[{ required: true }]}>
          <Select
            options={frequency}
          />
        </Form.Item>

        <Form.Item label="是否加标" valuePropName="checked">
          <Switch checked={plus} onChange={(checked)=>setPlus(checked)}/>
        </Form.Item>

        {plus && 
          <>
            <Form.Item label="加标日" rules={[{ required: true }]}>
              <Form.Item name="plus_day" label="加标日" rules={[{ required: true }]} noStyle>
                <InputNumber min={1} max={31}/>
              </Form.Item>
              <span className="ant-form-text day-text">日</span>
            </Form.Item>

            <Form.Item name="plus_cycle" label="加标周期" rules={[{ required: true }]}>
              <Select
                options={frequency}
              />
            </Form.Item>
          </>
        }

        <Form.Item label={`上次${lblBidedTxt}`}>
          <Form.Item name="last_bidded_date" label={`上次${lblBidedTxt}时间`} rules={[{ required: true }]} noStyle>
            <DatePicker />
          </Form.Item>
        </Form.Item>
        
        <Form.Item name="bidded_count" label="已标次数" rules={[{ required: true }]}>
          <InputNumber />
        </Form.Item>

        <Form.Item name="budget" label="标金" rules={[{ required: true }]}>
          <InputNumber />
        </Form.Item>

        <Form.Item name="count" label="会员数" rules={[{ required: true }]}>
          <InputNumber min={1} max={80} />
        </Form.Item>

        <Form.Item name="unit_count" label="拥有期数" rules={[{ required: true }]}>
          <InputNumber min={1} max={5} />
        </Form.Item>

        <Form.Item name="amount" label="预估会金额" rules={[{ required: true }]}>
          <InputNumber />
        </Form.Item>

        <Form.Item name="description" label="描述">
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
});