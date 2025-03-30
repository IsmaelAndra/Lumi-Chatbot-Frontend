import { Component, OnInit } from '@angular/core';
import { ResponsesService } from './service/responses.service';
import { Responses } from './responses.entity';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-responses',
  imports: [CommonModule, FormsModule],
  templateUrl: './responses.component.html',
  styleUrl: './responses.component.css'
})
export class ResponsesComponent implements OnInit {
  responses: Responses[] = [];
  loading = false;
  searchTerm = '';
  
  // Variables para el modal
  showModal = false;
  currentResponses: Responses = {
    id: 0,
    patterns: [''],
    responses: ['']
  };
  isEditMode = false;

  constructor(private responseService: ResponsesService) {}

  ngOnInit(): void {
    this.loadResponses();
  }

  loadResponses(): void {
    this.loading = true;
    this.responseService.getAllResponses().subscribe({
      next: (data) => {
        this.responses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading responses:', err);
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar las respuestas', 'error');
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentResponses = {
      id: 0,
      intent: '', // Asegúrate de incluir esta propiedad
      patterns: [''],
      responses: ['']
    };
    this.showModal = true;
  }
  
  openEditModal(responses: Responses): void {
    this.isEditMode = true;
    // Usa JSON.parse/stringify para crear una copia profunda
    this.currentResponses = JSON.parse(JSON.stringify(responses));
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  trackByIndex(index: number): number {
    return index;
  }
  
  updateIntent(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.currentResponses = {
      ...this.currentResponses,
      intent: target.value
    };
  }
  
  updatePattern(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    const newPatterns = [...this.currentResponses.patterns];
    newPatterns[index] = target.value;
    
    this.currentResponses = {
      ...this.currentResponses,
      patterns: newPatterns
    };
  }
  
  updateResponse(event: Event, index: number): void {
    const target = event.target as HTMLTextAreaElement;
    const newResponses = [...this.currentResponses.responses];
    newResponses[index] = target.value;
    
    this.currentResponses = {
      ...this.currentResponses,
      responses: newResponses
    };
  }

  addPattern(): void {
    this.currentResponses = {
      ...this.currentResponses,
      patterns: [...this.currentResponses.patterns, '']
    };
  }
  
  removePattern(index: number): void {
    if (this.currentResponses.patterns.length > 1) {
      const newPatterns = this.currentResponses.patterns.filter((_, i) => i !== index);
      this.currentResponses = {
        ...this.currentResponses,
        patterns: newPatterns
      };
    }
  }
  
  addResponse(): void {
    this.currentResponses = {
      ...this.currentResponses,
      responses: [...this.currentResponses.responses, '']
    };
  }
  
  removeResponse(index: number): void {
    if (this.currentResponses.responses.length > 1) {
      const newResponses = this.currentResponses.responses.filter((_, i) => i !== index);
      this.currentResponses = {
        ...this.currentResponses,
        responses: newResponses
      };
    }
  }

  onPatternChange(value: string, index: number): void {
    this.currentResponses.patterns[index] = value;
    this.currentResponses = {...this.currentResponses}; // Forzar cambio de referencia
  }

  saveResponse(): void {
    if (!this.validateResponse()) return;

    const operation = this.isEditMode
      ? this.responseService.updateResponse(this.currentResponses.id, this.currentResponses)
      : this.responseService.addResponse(this.currentResponses);

    operation.subscribe({
      next: () => {
        Swal.fire('Éxito', `Respuesta ${this.isEditMode ? 'actualizada' : 'creada'} correctamente`, 'success');
        this.loadResponses();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving responses:', err);
        Swal.fire('Error', 'Ocurrió un error al guardar la respuesta', 'error');
      }
    });
  }

  deleteResponse(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.responseService.deleteResponse(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La respuesta ha sido eliminada', 'success');
            this.loadResponses();
          },
          error: (err) => {
            console.error('Error deleting responses:', err);
            Swal.fire('Error', 'No se pudo eliminar la respuesta', 'error');
          }
        });
      }
    });
  }

  private validateResponse(): boolean {
    if (!this.currentResponses.patterns.some(p => p.trim() !== '') || 
        !this.currentResponses.responses.some(r => r.trim() !== '')) {
      Swal.fire('Error', 'Debes agregar al menos un patrón y una respuesta', 'error');
      return false;
    }
    return true;
  }

  get filteredResponses(): Responses[] {
    if (!this.searchTerm) return this.responses;
    return this.responses.filter(responses =>
      (responses.intent?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (responses.patterns.some(p => p.toLowerCase().includes(this.searchTerm.toLowerCase()))) ||
      (responses.responses.some(r => r.toLowerCase().includes(this.searchTerm.toLowerCase())))
    );
  }
}
