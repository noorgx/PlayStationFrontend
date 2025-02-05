import React from 'react';
import { Form } from 'react-bootstrap';
import { FaDesktop, FaGamepad, FaTv } from 'react-icons/fa';

const MachineSelector = ({ machines, selectedMachine, handleMachineChange, disabled }) => {
    // Function to render icons based on machine type
    const renderMachineIcon = (machineType) => {
        switch (machineType) {
            case 'Console':
                return <FaGamepad className="me-2" />;
            case 'PC':
                return <FaDesktop className="me-2" />;
            case 'TV':
                return <FaTv className="me-2" />;
            default:
                return null;
        }
    };

    return (
        <div dir="rtl">
            <Form.Group controlId="machineSelect" className="mb-3">
                <Form.Label>اختر الجهاز</Form.Label>
                <Form.Control
                    as="select"
                    onChange={handleMachineChange}
                    value={selectedMachine?.id || ''}
                    disabled={disabled}
                    className="text-right"
                >
                    <option value="">اختر جهازاً</option>
                    {machines.map((machine) => (
                        <option key={machine.id} value={machine.id}>
                            {renderMachineIcon(machine.machine_type)} 
                            {machine.machine_name} ({machine.machine_type})
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
        </div>
    );
};

export default MachineSelector;
