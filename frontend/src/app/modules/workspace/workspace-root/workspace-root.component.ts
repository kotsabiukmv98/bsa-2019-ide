import { EventService } from './../../../services/event.service/event.service';
import { LeavePageDialogService } from './../../../services/leave-page-dialog.service';
import { FileUpdateDTO } from './../../../models/DTO/File/fileUpdateDTO';
import { WorkspaceService } from './../../../services/workspace.service';

import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, OnChanges, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EditorSectionComponent } from '../editor-section/editor-section.component';
import { Observable, of, Subscription, Subject } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { map } from 'rxjs/internal/operators/map';

import { HttpResponse } from '@angular/common/http';
import { FileService } from 'src/app/services/file.service/file.service';
import { ProjectService } from 'src/app/services/project.service/project.service';
import { ProjectInfoDTO } from 'src/app/models/DTO/Project/projectInfoDTO';
import { TokenService } from 'src/app/services/token.service/token.service';
import { ProjectDialogService } from 'src/app/services/proj-dialog.service/project-dialog.service';
import { ProjectType } from '../../project/models/project-type';
import { RightsService } from 'src/app/services/rights.service/rights.service';
import { UserAccess } from 'src/app/models/Enums/userAccess';
import { FileBrowserSectionComponent, SelectedFile } from '../file-browser-section/file-browser-section.component';
import { FileDTO } from 'src/app/models/DTO/File/fileDTO';
import { HotkeyService } from 'src/app/services/hotkey.service/hotkey.service';
import { FileRenameDTO } from '../../../models/DTO/File/fileRenameDTO';
import { BuildService } from 'src/app/services/build.service';
import { Language } from 'src/app/models/Enums/language';
import { EditorSettingDTO } from 'src/app/models/DTO/Common/editorSettingDTO';
import { SignalRService } from 'src/app/services/signalr.service/signal-r.service';
import { filter } from 'rxjs/operators';
import { ErrorHandlerService } from 'src/app/services/error-handler.service/error-handler.service';
import { FileEditService } from 'src/app/services/file-edit.service/file-edit.service';
import { TerminalService } from 'primeng/components/terminal/terminalservice';


@Component({
    selector: 'app-workspace-root',
    templateUrl: './workspace-root.component.html',
    styleUrls: ['./workspace-root.component.sass']
})
export class WorkspaceRootComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
        throw new Error("Method not implemented.");
    }
    public prepareQuery;
    public projectId: number;
    public userId: number;
    public access: UserAccess;
    public showFileBrowser = true;
    public showSearchField = false;
    public large = false;
    public canRun = false;
    public canBuild = false;
    public canNotEdit = false;
    public expandFolder = false;
    public project: ProjectInfoDTO;
    public options: EditorSettingDTO;
    public iOpenFile: FileUpdateDTO[] = [];
    public inputItems: string[];
    public connectionId: string;
    public isInputTerminalOpen=false;

    private routeSub: Subscription;
    private authorId: number;

    public eventsSubject: Subject<void> = new Subject<void>();

    @ViewChild(EditorSectionComponent, { static: false })
    private editor: EditorSectionComponent;

    @ViewChild(FileBrowserSectionComponent, { static: false })
    private fileBrowser: FileBrowserSectionComponent;


    constructor(
        private route: ActivatedRoute,
        private toast: ToastrService,
        private workSpaceService: WorkspaceService,
        private saveOnExit: LeavePageDialogService,
        private rightService: RightsService,
        private projectService: ProjectService,
        private projectEditService: ProjectDialogService,
        private tokenService: TokenService,
        private hotkeys: HotkeyService,
        private buildService: BuildService,
        private eventService: EventService,
        private cdr: ChangeDetectorRef,
        private signalRService: SignalRService,
        private errorHandlerService: ErrorHandlerService,
        private fileEditService: FileEditService) {

        this.hotkeys.addShortcut({ keys: 'control.h' })
            .subscribe(() => {
                this.hideFileBrowser();
            });
        this.hotkeys.addShortcut({ keys: 'control.b' })
            .subscribe(() => {
                this.onBuild();
            });
        this.hotkeys.addShortcut({ keys: 'control.r' })
            .subscribe(() => {
                this.onRun();
            });
    }

    ngAfterViewInit() {
        console.log("afterviewinit");
        this.route.queryParams.subscribe(params => {
            if (!!params['query']) {
                this.fileBrowser.curSearch = params['query'];
                this.showSearchField = true;
                this.cdr.detectChanges();
            }
            // if (!!params['fileId']) {
            //     console.log(params['fileId']);
            //     setTimeout(() => {
            //         this.onFileSelected(params['fileId']);
            //     }, 6000)
            //     this.onFileSelected(params['fileId']);
            // }
        });
    }

    public OnChange(event: boolean){
        if(event)
        {
            this.inputItems=null;
            this.isInputTerminalOpen=false;
        }
    }

    ngOnInit() {
        this.eventService.initComponentFinished$.
            pipe(
                filter(m => m === "EditorSectionComponent"),
                switchMap(() => {
                    return this.route.queryParams;
                }),
                filter(params => !!params['fileId']),
                map(params => params['fileId']))
            .subscribe(fileId => this.onFileSelected(fileId));

        this.userId = this.tokenService.getUserId();

        this.routeSub = this.route.params.subscribe(params => {
            this.projectId = params['id'];
        });

        this.projectService.getProjectById(this.projectId)
            .subscribe(
                (resp) => {
                    this.project = resp.body;
                    this.eventService.currProjectSwitch({ id: this.project.id, name: this.project.name });
                    this.authorId = resp.body.authorId;
                    //this.project.editorProjectSettings.readOnly=false;
                    this.options = this.project.editorProjectSettings;
                    if (this.canNotEdit) {
                        this.options.readOnly = true;
                    }
                    if (this.project.authorId != this.userId) {
                        this.rightService.getUserRightById(this.userId, this.projectId)
                            .subscribe(
                                (resp) => {
                                    this.access = resp.body;
                                    this.setUserAccess();
                                }
                            )
                    }
                    this.fileEditService.startConnection(this.userId, this.project.id);
                    this.fileEditService.openedFiles.subscribe(x => 
                        {
                            if (x.userId !== this.userId) {
                                this.fileBrowser.changeFileState(x.fileId, x.isOpen, x.nickName);
                                this.editor.monacoOptions.readOnly = true;
                                
                                if (!x.isOpen && this.editor.contains(x.fileId)) {
                                    this.fileEditService.openFile(x.fileId, this.project.id);
                                }
                            } else if(x.userId === this.userId && this.editor.contains(x.fileId)) {
                                console.log("it's my own file");
                                this.editor.changeFileState(x.fileId);
                                this.workSpaceService.getFileById(x.fileId).subscribe(resp => {
                                    this.editor.updateFile({content: resp.body.content, id: resp.body.id, name: null, folder: null, isOpen: null, updater: null, language: null});
                                })
                                setTimeout(() => {
                                    this.editor.changeReadOnlyState(false);
                                }, 1500);
                            }
                        });
                },
                () => {
                    this.toast.error("Can't load selected project.", 'Error Message');
                }
            );
    }

    private findAllOccurence(substring?: string) {
        if (substring == null)
            return;
        setTimeout(() => {
            this.editor.hightlineMatches(substring);
        }, 500)
    }

    public getProjectColor(): string {
        return this.project.color;
    }

    public Settings() {
        const a = this.workSpaceService.show(this.project);
        a.subscribe(
            (resp) => {
                if (resp) {
                    this.options = resp as EditorSettingDTO;
                }
            }
        );
    }

    public setUserAccess() {
        switch (this.access) {
            case 0:
                this.canNotEdit = true;
                break;
            case 2:
                this.canNotEdit = false;
                this.canBuild = true;
                break;
            case 3:
                this.canNotEdit = false;
                this.canBuild = true;
                this.canRun = true;
                break;
            default:
                break
        }
    }

    public isAuthor(): boolean {
        if (this.authorId == this.tokenService.getUserId()) {
            return true;
        }
        return false;
    }

    public onFileRenaming(fileUpdate: FileRenameDTO) {
        const tab = this.editor.tabs.find(x => x.id === fileUpdate.id);
        if (tab !== undefined) {
            tab.label = fileUpdate.name;
        }
    }

    public onFileSelected(selectedFile: SelectedFile): void {
        if (this.editor && this.editor.openedFiles.some(f => f.innerFile.id === selectedFile.fileId)) {
            this.editor.activeItem = this.editor.tabs.find(i => i.id === selectedFile.fileId);
            this.editor.code = this.editor.openedFiles.find(f => f.innerFile.id === selectedFile.fileId).innerFile.content;
            this.editor.monacoOptions.language = this.editor.openedFiles.find(f => f.innerFile.id === selectedFile.fileId).innerFile.language;
            this.findAllOccurence(selectedFile.filterString);
            return;
        }

        this.workSpaceService.getFileById(selectedFile.fileId)
            .subscribe(
                (resp) => {
                    if (resp.ok) {
                        const { id, name, content, folder, updaterId, isOpen, updater, language } = resp.body as FileDTO;
                        const fileUpdateDTO: FileUpdateDTO = { id, name, content, folder, isOpen, updaterId, updater, language };
                        var tabName = name;
                        this.editor.AddFileToOpened(fileUpdateDTO);
                        this.editor.monacoOptions.readOnly = true;
                        if (!fileUpdateDTO.isOpen) {
                            this.fileIsOpen(fileUpdateDTO);
                            this.iOpenFile.push(fileUpdateDTO);
                            this.fileBrowser.selectedItem.label = tabName;
                        }
                        else if (this.project.accessModifier == 1) {
                            this.fileIsOpen(fileUpdateDTO);
                            this.iOpenFile.push(fileUpdateDTO);
                        }
                        if(this.showFileBrowser) {
                            document.getElementById('workspace').style.width = ((this.workspaceWidth) / this.maxSize()) + '%';
                        }
                        this.editor.addActiveTab(tabName, selectedFile.fileIcon, id);
                        this.findAllOccurence(selectedFile.filterString);
                        this.editor.code = content;

                    } else {
                        this.toast.error("Can't load selected file.", 'Error Message');
                    }
                },
                (error) => {
                    this.toast.error("Can't load selected file.", 'Error Message');
                    console.error(error.message);
                },
                () => {
                    this.fileEditService.openFile(selectedFile.fileId, this.project.id);
                }
            );
    }

    public onBuild() {
        this.buildService.buildProject(this.project.id).subscribe(
            () => {
                this.toast.info('Build was started', 'Info Message', { tapToDismiss: true });
            },
            (error) => {
                console.log(error);
                this.toast.error(this.errorHandlerService.getExceptionMessage(error), 'Error Message', { tapToDismiss: true });
            }
        );
    }

    public onRun() {
        if (this.project.language !== Language.cSharp) {
            this.toast.info('Only C# project available for run', 'Info Message', { tapToDismiss: true });
            return;
        }

        this.connectionId = this.signalRService.getConnectionId();
        if (this.connectionId == null) {
            this.toast.error('Please check your internet connection and refresh page before run', 'Info Message', { tapToDismiss: true });
            return;
        }

        this.buildService.runProject(this.project.id, this.connectionId).subscribe(
            (resp) => {
                this.inputItems = resp.body;
                this.isInputTerminalOpen=true;
                if(!this.inputItems || this.inputItems.length==0)
                {
                    this.toast.info('Run was started', 'Info Message', { tapToDismiss: true });
                }
            },
            (error) => {
                console.log(error);
                this.toast.error('Something bad happened(', 'Error Message', { tapToDismiss: true });
            }
        )
    }

    public onFilesSave(files?: FileUpdateDTO[]) {
        if (this.iOpenFile.length != 0) {
            this.iOpenFile.forEach(element => {
                element.isOpen = false;
            })
            this.saveFilesRequest(this.iOpenFile).subscribe();

            this.iOpenFile = [];
        }
        if (!this.editor.anyFileChanged()) {
            return;
        }
        this.saveFilesRequest(files)
            .subscribe(
                success => {
                    if (success.every(x => x.ok)) {
                        this.toast.success("Files saved", 'Success', { tapToDismiss: true });
                    } else {
                        this.toast.error("Can't save files", 'Error', { tapToDismiss: true });
                    }
                },
                error => { this.toast.error(this.errorHandlerService.getExceptionMessage(error), 'Error', { tapToDismiss: true }) });
    }

    public fileIsOpen(files: FileUpdateDTO) {
        this.workSpaceService.saveFileRequest(files).subscribe();
    }

    public hideSearchField() {
        this.showSearchField = !this.showSearchField;
    }

    public hideFileBrowser() {
        this.showFileBrowser = !this.showFileBrowser;
        if (!this.showFileBrowser && this.showSearchField) {
            this.showFileBrowser = true;
        }
        if (this.showFileBrowser) {
            this.showSearchField = false;
        }
        if(!this.showFileBrowser) {
            this.workspaceWidth = document.getElementById('workspace').offsetWidth;
            document.getElementById('workspace').style.width = '100%';
        } else {
            document.getElementById('workspace').style.width = ((this.workspaceWidth - 1)/ this.maxSize() * 100) + '%';
        }
    }

    public editProjectSettings() {
        this.projectEditService.show(ProjectType.Update, this.projectId);
    }

    public expand() {
        this.eventsSubject.next();
    }

    public refresh() {
        this.fileBrowser.ngOnInit();
    }

    private saveFilesRequest(files?: FileUpdateDTO[]): Observable<HttpResponse<FileUpdateDTO>[]> {
        if (!files) {
            files = this.editor.openedFiles.map(x => x.innerFile);
        }
        return this.workSpaceService.saveFilesRequest(files);
    }

    private isDown: boolean;
    private workspaceWidth: number;
    private startHorPos: number;
    private movingRight: number; 

    public draggableDown(e: MouseEvent) {
        e.preventDefault();
        this.isDown = true;
        this.startHorPos = e.x;
    }

    public draggableMove(e: MouseEvent) {
        if (this.isDown) {
            e.preventDefault();
            this.movingRight = e.x - this.startHorPos;
            this.startHorPos = e.x;
            let browserElement = document.getElementById('browser'); 
            let workspaceElement = document.getElementById('workspace'); 
            let width = browserElement.offsetWidth + this.movingRight;
            browserElement.style.width = (width / this.maxSize() * 100) + '%';
            workspaceElement.style.width = (this.calc(width) / this.maxSize() * 100) + '%';
            this.workspaceWidth = workspaceElement.offsetWidth;
        }
    }
    
    private maxSize() {
        return document.getElementById('container').offsetWidth;
    }

    private calc(size: number): number {
        return document.getElementById('container').offsetWidth - size - 5;
    }

    public draggableUp(e: MouseEvent) {
        if(e.type === 'mouseup') {
            this.isDown = false;
        }
        else if (e.y < 100 || e.x < 50) {
            this.isDown = false;
        }
    }

    canDeactivate(): Observable<boolean> {
        return !this.editor.anyFileChanged() ? of(true) : this.saveOnExit.confirm('Save changes?')
            .pipe(
                switchMap(
                    mustSave => mustSave ? this.saveFilesRequest().pipe(map(result => result.every(x => x.ok) ? true : false)) : of(false)));
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.fileEditService.openedFiles.unsubscribe();
        this.fileEditService.closeProject(this.project.id);
        this.signalRService.deleteConnectionIdListener();
    }
}
