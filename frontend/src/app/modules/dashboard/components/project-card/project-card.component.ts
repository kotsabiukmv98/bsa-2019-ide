import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ProjectDescriptionDTO } from '../../../../models/DTO/Project/projectDescriptionDTO';
import { ProjectService } from 'src/app/services/project.service/project.service';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service/token.service';
import { MenuItem } from 'primeng/api';
import { ProjectDialogService } from 'src/app/services/proj-dialog.service/project-dialog.service';
import { ProjectType } from 'src/app/modules/project/models/project-type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ProjDialogDataService } from 'src/app/services/proj-dialog-data.service/proj-dialog-data.service';

@Component({
    selector: 'app-project-card',
    templateUrl: './project-card.component.html',
    styleUrls: ['./project-card.component.sass'],
    encapsulation: ViewEncapsulation.None
})
export class ProjectCardComponent implements OnInit {
    @Input() project: ProjectDescriptionDTO;
    @Output() showMenu = new EventEmitter<any>();
    DATE = new Date();
    currentUserId: number;
    contextMenu: MenuItem[];
    private unsubscribe$ = new Subject<void>();

    constructor(
        private projectService: ProjectService,
        private tokenService: TokenService,
        private router: Router,
        private projectEditDialog: ProjectDialogService,
        private projectData: ProjDialogDataService) { }

    ngOnInit() {
        this.currentUserId = this.tokenService.getUserId();

        this.projectData.todos$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((proj) => {
                if(proj === null) {
                    return;
                }
                if (proj.id === this.project.id) {
                    proj.lastBuild = this.project.lastBuild;
                    proj.buildStatus = this.project.buildStatus;
                    this.project = proj;
                }
            });
    }

    public favourite(event: Event): void {
        event.stopPropagation();
        this.project.favourite = !this.project.favourite;

        this.projectService.changeFavourity(this.project.id)
            .subscribe();
    }

    public GoToPage(page: string) {
        switch (page) {
            case 'details': {
                this.router.navigate([`/project/${this.project.id}`]);
                break;
            }
            case 'settings': {
                this.router.navigate([`/project/${this.project.id}/settings`]);
                break;
                }
            }
        }
    

    lastTimeBuild(): string {
        const daysCount = this.getDaysCountFromCurrentDate(this.project.lastBuild);
        if (daysCount > 365) {
            return Math.floor(daysCount / 365) + ' year ago';
        } else if (daysCount > 31) {
            return Math.floor(daysCount / 30) + ' month ago';
        } else {
            return daysCount > 1 ? daysCount + ' days ago' : daysCount === 1 ? 'yesterday' : 'today';
        }
    }

    getDaysCountFromCurrentDate(date: Date): number {
        const days = date.getUTCDate();
        const month = date.getUTCMonth();
        const year = date.getUTCFullYear();

        const currentDays = this.DATE.getUTCDate();
        const currentMonth = this.DATE.getUTCMonth();
        const currentYear = this.DATE.getUTCFullYear();

        return ((currentYear - 2019) * 365 + currentMonth * 30 + currentDays) - ((year - 2019) * 365 + month * 30 + days);
    }

    prepCm() {
        if(this.currentUserId!=this.project.creatorId){
            this.contextMenu = [
                {label: 'Details', icon: 'pi pi-info-circle', command: (event) => this.GoToPage('details') }
            ];
        }
        else{
            this.contextMenu = [
                {label: 'Details', icon: 'pi pi-info-circle', command: (event) => this.GoToPage('details') },
                {label: 'Settings', icon: 'pi pi-cog', command: (event) => this.projectEditDialog.show(ProjectType.Update, this.project.id)}
            ];
        }
    }

    openCm(event, menu) {
        event.preventDefault();
        event.stopPropagation();
        this.showMenu.emit(menu);
        this.prepCm();
        menu.show(event);
        return false;
    }
    
    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
