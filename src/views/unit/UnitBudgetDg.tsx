import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Form, InputNumber, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Unit, UnitBudget } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import { unitBudgetFmc } from '../../model/fmc-unit-budget';
import { antdModal } from '../../ts/nice-modal-fix';
import LunarDatePicker from '../comp/LunarDatePicker';
import "./UnitBudgetDg.pcss";

function UnitBudgetDg({ unit, unitBudget }: { unit: Unit, unitBudget?:UnitBudget }) {
  const modal = useModal();
  const [form] = Form.useForm();
  const [data] = useState(unitBudget);

  const handleSubmit = useCallback(() => {
    form.validateFields().then(async () => {
      const newUnitBudget = { ...form.getFieldsValue() };

      if(!data?.id){
        await unitBudgetFmc.create(newUnitBudget);
      }else{
        await unitFmc.update(data?.id!, newUnitBudget);
      }
      modal.resolve(newUnitBudget);
      modal.hide();
    }).catch((e) => {console.log(e)});
  }, [modal, unit, form]);

  const validateMessages = {
    required: '${label}是必填项!',
  }

  return (
    <Modal
      {...antdModal(modal)}
      title={unitBudget ? '竞标信息修改' : '竞标信息添加'}
      okText={unitBudget ? '修改' : '添加'}
      onOk={handleSubmit}
      centered={true}
      className='UnitBudgetDg'
    >
      <Form form={form}
        labelCol={{ span: 5 }}
        validateMessages={validateMessages}
        initialValues={{
          is_self:data?.is_self ?? false, 
          budget: data?.budget ?? 0, 
          budget_date: dayjs(data?.budget_date) ?? ""
        }}>
        <Form.Item name="is_self" label="谁竞标了" rules={[{ required: true }]}>
          <Select
            options={[
              { value: true, label: '自己' },
              { value: false, label: '别人' }
            ]}
          />
        </Form.Item>

        <Form.Item label="竞标日">
          <Form.Item name="last_bidded_date" label="竞标日" rules={[{ required: true }]} noStyle>
            <LunarDatePicker />
          </Form.Item>
        </Form.Item>

        <Form.Item name="budget" label="标金" rules={[{ required: true }]}>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default NiceModal.create(UnitBudgetDg);