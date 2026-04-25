'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { servicesApi, requestsApi } from '@/lib/api';
import { Service } from '@/types';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRequestModal({ isOpen, onClose, onSuccess }: CreateRequestModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    serviceId: '',
    description: '',
    address: '',
    lat: '19.4326',
    lng: '-99.1332',
    scheduledAt: '',
  });

  useEffect(() => {
    if (isOpen) {
      servicesApi.getAll().then(setServices).catch(console.error);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceId) {
      setError('Selecciona un servicio');
      return;
    }
    if (!form.description || form.description.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }
    if (!form.address) {
      setError('La dirección es requerida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestsApi.create({
        serviceId: form.serviceId,
        description: form.description,
        address: form.address,
        lat: parseFloat(form.lat) || 19.4326,
        lng: parseFloat(form.lng) || -99.1332,
        scheduledAt: form.scheduledAt || undefined,
      });

      setForm({
        serviceId: '',
        description: '',
        address: '',
        lat: '19.4326',
        lng: '-99.1332',
        scheduledAt: '',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = [
    { value: '', label: 'Seleccionar servicio...' },
    ...services.map((s) => ({
      value: s.id,
      label: `${s.name} — ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(s.basePrice)}`,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Solicitud de Servicio" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Servicio"
          name="serviceId"
          value={form.serviceId}
          onChange={handleChange}
          options={serviceOptions}
          required
        />

        <Textarea
          label="Descripción del problema"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe detalladamente el servicio que necesitas..."
          rows={3}
          required
        />

        <Input
          label="Dirección"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Calle, número, colonia, ciudad"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitud"
            name="lat"
            type="number"
            step="any"
            value={form.lat}
            onChange={handleChange}
          />
          <Input
            label="Longitud"
            name="lng"
            type="number"
            step="any"
            value={form.lng}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Fecha programada (opcional)"
          name="scheduledAt"
          type="datetime-local"
          value={form.scheduledAt}
          onChange={handleChange}
        />

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-900/20 border border-red-800 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Crear Solicitud
          </Button>
        </div>
      </form>
    </Modal>
  );
}
