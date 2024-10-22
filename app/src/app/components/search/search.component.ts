import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule,} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {BehaviorSubject, debounceTime, distinctUntilChanged, Subject, take, takeUntil,} from 'rxjs';
import {DataItem, Mappings, SearchResults} from '../../shared/interfaces';
import {ChartService} from '../../shared/services';
import {map} from 'rxjs/operators';

enum TagClassNameEnum {
  'active-tick' = 'bg-success',
  alpaca = 'bg-danger',
  cryptoquote = 'bg-warning',
  dxfeed = 'bg-black text-warning',
  oanda = 'bg-info',
  simulation = 'bg-dark',
}

@Component({
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  selector: 'app-search',
  standalone: true,
  styleUrl: 'search.component.css',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
  chartService = inject(ChartService);
  formBuilder = inject(FormBuilder);
  eRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @Input()
  providers: string[] = [];

  @Input()
  searchResults: SearchResults[] = [];

  @Output()
  onSubscribeClick = new EventEmitter<{ item: DataItem; provider: string }>();

  filteredItems$ = new BehaviorSubject<DataItem[]>([]);

  subscriptionDuration$ = new Subject<void>();

  searchForm!: FormGroup;

  isFocused = false;

  selectedProvider = '';

  ngOnInit(): void {
    this.buildForm();
    this.selectByProviderAndSymbol();
    this.searchForm
      .get('search')
      ?.valueChanges.pipe(
      takeUntil(this.subscriptionDuration$),
      debounceTime(500),
      distinctUntilChanged(),
    )
      .subscribe((value) => {
        this.selectByProviderAndSymbol(value, this.selectedProvider);
      });
  }

  buildForm(): void {
    this.searchForm = this.formBuilder.group({
      search: [''],
    });
  }

  focusInput(): void {
    this.isFocused = true;
  }

  closeDropdown(): void {
    this.isFocused = false;
  }

  selectByProviderAndSymbol(symbol = '', provider = ''): void {
    this.chartService
      .getInstrumentsList({symbol, provider})
      .pipe(
        take(1),
        map((instruments) => instruments.data),
      )
      .subscribe((dataItems) => {
        this.filteredItems$.next(dataItems);
      });
  }

  onSubscribeButtonClick(): void {
    const selectedValue = this.searchForm.get('search')?.value;
    selectedValue &&
    this.onSubscribeClick.emit({
      item: this.filteredItems$.value[0],
      provider: this.selectedProvider,
    });
    this.closeDropdown();
  }

  getClassByTag(tag: string): TagClassNameEnum {
    return TagClassNameEnum[tag as keyof typeof TagClassNameEnum] || '';
  }

  onItemClick(name: string): void {
    this.searchForm.get('search')?.patchValue(name);
  }

  onProviderClick(provider: string): void {
    this.selectedProvider = provider;
    this.selectByProviderAndSymbol(
      this.searchForm.get('search')?.value,
      provider,
    );
  }

  onResetClick() {
    this.searchForm.get('search')?.patchValue('');
    this.selectedProvider = '';
  }

  transformTags(mappings: Mappings): string[] {
    return Object.keys(mappings);
  }

  ngOnDestroy(): void {
    this.subscriptionDuration$.next();
    this.subscriptionDuration$.complete();
  }
}
