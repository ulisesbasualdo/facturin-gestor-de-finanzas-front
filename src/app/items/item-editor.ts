import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { form, FormField, FormRoot, TreeValidationResult } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { userErrorMessage } from '../api/http-error-message';
import { EditTarget } from './_definitions';
import { ItemActions } from './item-actions';
import { ItemEditSession } from './item-edit-session';
import { itemFormSchema, toFormModel, toItemFields } from './item-form';

/** Número que se agrega a los ids de cada editor para que no se repitan en la página. */
let nextEditorNumber = 0;

@Component({
  selector: 'app-item-editor',
  imports: [FormField, FormRoot],
  templateUrl: './item-editor.html',
  styleUrl: './item-editor.scss',
  host: {
    '(keydown.escape)': 'cancel()',
  },
})
export class ItemEditor {
  /** Edición abierta: abre, cierra y devuelve el foco. */
  private readonly session = inject(ItemEditSession);
  /** Acciones que guardan el movimiento en el backend. */
  private readonly actions = inject(ItemActions);

  /** Qué se edita: un movimiento existente o un alta. */
  readonly target = input.required<EditTarget>();

  /** Indica si es un alta (`true`) o la edición de un movimiento existente (`false`). */
  protected readonly isNew = computed(() => this.target().mode === 'add');
  /** Id del contenedor de mensajes de error, al que apuntan los campos con `aria-describedby`. */
  protected readonly errorsId = `item-editor-errors-${nextEditorNumber++}`;

  /** Valores del formulario mientras se edita; arrancan con los de la edición recibida. */
  private readonly model = linkedSignal(() => toFormModel(this.target()));
  /** Formulario con sus reglas de validación y la acción de guardar. */
  protected readonly itemForm = form(this.model, itemFormSchema, {
    submission: {
      action: () => firstValueFrom(this.save()),
      onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
    },
  });

  /** Texto del casillero de completado según el tipo (`Cobrado` o `Pagado`). */
  protected readonly completedLabel = computed(() =>
    this.itemForm.kind().value() === 'income' ? 'Cobrado' : 'Pagado',
  );
  /** Indica si el título tiene que mostrarse como inválido. */
  protected readonly titleInvalid = computed(
    () => this.itemForm.title().touched() && this.itemForm.title().invalid(),
  );
  /** Indica si el monto tiene que mostrarse como inválido. */
  protected readonly priceInvalid = computed(
    () => this.itemForm.price().touched() && this.itemForm.price().invalid(),
  );
  /** Mensajes de error visibles: los de los campos ya tocados y los que devolvió el backend. */
  protected readonly errorMessages = computed(() => {
    const fieldErrors = [this.itemForm.title, this.itemForm.price]
      .filter((field) => field().touched())
      .flatMap((field) => field().errors());
    return [...fieldErrors, ...this.itemForm().errors()]
      .map((error) => error.message)
      .filter((message) => message !== undefined);
  });

  /** Campo del título, que recibe el foco al abrir el editor. */
  private readonly titleInput = viewChild.required<ElementRef<HTMLInputElement>>('titleInput');

  constructor() {
    afterNextRender(() => this.titleInput().nativeElement.focus());
  }

  /** Cierra el editor sin guardar. */
  protected cancel(): void {
    this.session.close();
  }

  /** Envía el movimiento; si sale bien cierra el editor y emite `null` (sin errores), si falla emite el error. */
  private save(): Observable<TreeValidationResult> {
    const target = this.target();
    const id = target.mode === 'edit' ? target.item.id : undefined;
    const fallback = this.isNew() ? 'No pudimos agregar el movimiento.' : 'No pudimos guardar los cambios.';
    return this.actions.save(id, toItemFields(this.model())).pipe(
      tap(() => this.session.close()),
      map(() => null),
      catchError((error) => of({ kind: 'serverError', message: userErrorMessage(error, fallback) })),
    );
  }
}
