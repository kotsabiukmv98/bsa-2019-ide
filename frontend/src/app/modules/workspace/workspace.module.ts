import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceRootComponent } from './workspace-root/workspace-root.component';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { FileBrowserSectionComponent } from './file-browser-section/file-browser-section.component';
import { EditorSectionComponent } from './editor-section/editor-section.component';
import { GeneralModule } from 'src/app/general/general.module';
import { ButtonModule } from 'primeng/button';
import {TreeModule} from 'primeng/tree';

@NgModule({
  declarations: [WorkspaceRootComponent, FileBrowserSectionComponent, EditorSectionComponent],
  imports: [
    CommonModule,
    WorkspaceRoutingModule,
    GeneralModule,
    ButtonModule,
    TreeModule
  ]
})
export class WorkspaceModule { }
