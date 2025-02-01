import React from 'react';
import { Form } from 'react-bootstrap';

const MachineSelector = ({ machines, selectedMachine, handleMachineChange, disabled }) => {
    return (
        <div dir="rtl">
        <Form.Group controlId="machineSelect" className="mb-3">
            <Form.Label>اختر الجهاز</Form.Label>
            <Form.Control 
                as="select" 
                onChange={handleMachineChange} 
                value={selectedMachine?.id || ''}
                disabled={disabled} // Use the disabled prop here
            >
                <option value="">اختر جهازاً</option>
                {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                        {machine.machine_name} ({machine.machine_type})
                    </option>
                ))}
            </Form.Control>
        </Form.Group>
        </div>
    );
};

export default MachineSelector;
