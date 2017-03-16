import {
    Component, ElementRef, ViewChild, OnInit, OnChanges, NgZone
} from '@angular/core';
// import { SebmGoogleMap, SebmGoogleMapPolygon, LatLngLiteral } from 'angular2-google-maps/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as Rx from 'rxjs/Rx';
import { Router } from '@angular/router';

declare var $: any;
declare var TGOS: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit  {
    title: string = '高雄樁位';
    list1: any[] = [];
    listQuery: any[] = [];
    list2: Observable<any>;
    list3: any[] = [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }, { a: 6 }, { a: 7 }, { a: 8 }, { a: 9 }];
    pMap: any;
    data: any;
    selectedRow: Number;
    clickMessageBox: any;
    items: any;
    UppmNameQ: string = '';
    TypeSelectValue: string[] = []; // Array of strings for multi select, string for single select.
    TypeOptions: Array<any> = [
        { value: '界樁', label: '界樁' },
        { value: '中心樁', label: '中心樁' },
        { value: '虛樁', label: '虛樁' },
        { value: '副樁', label: '副樁' },
    ];
    InspectSelectValue: string[] = [];
    InspectOptions: Array<any> = [
        { value: '石樁', label: '石樁' },
        { value: '鐵蓋', label: '鐵蓋' },
    ];
    marker: any;
    url: string = 'http://localhost:5000/api/values';
    InfoWindowOptions = {
        opacity: 0.8,
        maxWidth: 700,         // 訊息視窗的最大寬度
        pixelOffset: new TGOS.TGSize(5, -30) // InfoWindow起始位置的偏移量, 使用TGSize設定, 向右X為正, 向上Y為負 
    };

    sub: Subscription;

    constructor(private el: ElementRef, private zone: NgZone, private http: Http) {
    }

    onSelected(event: any) {
        console.log('event');
    }

    ngOnInit() {
        // this.r
        console.clear();
        console.log('onInit');
    }

    MapDataSubscribe(isLoadMap = false) {
        let aa = this.http.get(this.url).subscribe(
            obj => {
                this.list1 = (obj.json() as any[]).filter(
                    (x: any) => (x.UppmName as string).includes(this.UppmNameQ) &&
                        (this.TypeSelectValue.length === 0 || this.TypeSelectValue.indexOf(x.Type as string) !== -1) &&
                        (this.InspectSelectValue.length === 0 || this.InspectSelectValue.indexOf(x.Inspect as string) !== -1)
                );
                console.log(Date.now(), 'loadData');
            },
            err => console.error(err),
            () => {

                console.log(Date.now(), 'complete...');
                setTimeout(() => {
                    if (isLoadMap) {
                        this.LoadMap();
                    }

                    aa.unsubscribe();
                    console.log(Date.now(), 'unsubscribe');
                }, 0);
            });
    }

    ngAfterViewChecked() {
    }

    ngAfterContentInit() {
    }

    ngAfterContentChecked() {

    }

    get filteredAlbumList() {

        return this.list1.filter(
            (x: any) => (x.UppmName as string).includes(this.UppmNameQ) &&
                (this.TypeSelectValue.length === 0 || this.TypeSelectValue.indexOf(x.Type as string) !== -1)
        );

    }

    LoadMap() {

        let pOMap = document.getElementById('TGMap');  // 宣告一個網頁容器
        let mapOptiions = {
            scaleControl: false,                // 不顯示比例尺
            navigationControl: false,            // 顯示地圖縮放控制項
            navigationControlOptions: {         // 設定地圖縮放控制項
                controlPosition: TGOS.TGControlPosition.TOP_LEFT,  // 控制項位置
                navigationControlStyle: TGOS.TGNavigationControlStyle.SMALL         // 控制項樣式
            },
            mapTypeControl: false                   // 不顯示地圖類型控制項
        };
        this.pMap = new TGOS.TGOnlineMap(pOMap, TGOS.TGCoordSys.EPSG3826, mapOptiions);    // 建立地圖,選擇TWD97坐標
        this.pMap.setZoom(6);                                     // 初始地圖縮放層級
        this.pMap.setCenter(new TGOS.TGPoint(306954, 2770049));                                     // 初始地圖縮放層級

        for (let i = 0; i < this.list1.length; i++) {
            // ------------------建立標記點---------------------
            // // 設定標記點圖片及尺寸大小
            // let markerImg = new TGOS.TGImage('http://api.tgos.tw/TGOS_API/images/marker2.png',
            //     new TGOS.TGSize(38, 33), new TGOS.TGPoint(0, 0), new TGOS.TGPoint(10, 33));
            // 設定標記點圖片及尺寸大小
            let iconStr = 'http://api.tgos.tw/TGOS_API/images/marker2.png';
            if (this.list1[i].Inspect === '石樁') {
                iconStr = 'meowth.png';
            } else if (this.list1[i].Inspect === '鐵蓋') {
                iconStr = 'pikachu.png';
            }
            let markerImg = new TGOS.TGImage(iconStr,
                new TGOS.TGSize(38, 33), new TGOS.TGPoint(0, 0), new TGOS.TGPoint(10, 33));
            // 建立機關單位標記點
            let pTGMarker = new TGOS.TGMarker(this.pMap,
                new TGOS.TGPoint(this.list1[i].x, this.list1[i].y), '', markerImg, { flat: false });
            // 建立訊息視窗   
            let messageBox = new TGOS.TGInfoWindow(this.GetInfoWindow(this.list1[i]),
                new TGOS.TGPoint(this.list1[i].x, this.list1[i].y), this.InfoWindowOptions);

            new TGOS.TGEvent.addListener(pTGMarker, 'mouseover', () => {
                this.zone.run(() => {
                    messageBox.open(this.pMap, pTGMarker);
                });
            }); // 滑鼠監聽事件--開啟訊息視窗
            new TGOS.TGEvent.addListener(pTGMarker, 'mouseout', () => {
                this.zone.run(() => {
                    messageBox.close();
                });
            });
        }
    }

    eventHandler(data: any) {
        //  this.selectedRow = index;
        console.log(data);
        this.data = data;
        this.pMap.setCenter(new TGOS.TGPoint(data.x, data.y));

        let markerImg = new TGOS.TGImage('http://api.tgos.tw/TGOS_API/images/marker1.png',
            new TGOS.TGSize(38, 33), new TGOS.TGPoint(0, 0), new TGOS.TGPoint(10, 33));
        if (this.marker !== undefined) {
            this.marker.setMap(null);
        }
        this.marker = new TGOS.TGMarker(this.pMap, new TGOS.TGPoint(this.data.x, this.data.y), '', markerImg, { flat: false });
        this.pMap.setZoom(12);                                     // 初始地圖縮放層級

        if (this.clickMessageBox !== undefined) {
            this.clickMessageBox.close();
        }
        this.clickMessageBox = new TGOS.TGInfoWindow(this.GetInfoWindow(this.data),
            new TGOS.TGPoint(this.data.x, this.data.y), this.InfoWindowOptions);
        this.clickMessageBox.open(this.pMap, new TGOS.TGPoint(this.data.x, this.data.y));
    }

    GetInfoWindow(data: any): string {
        let str = `<div style="word-wrap:break-word;"><b >${data.UppmName}</b></div>`;
        str += `<br/><b>識別碼</b>: ${data.Id}`;
        str += `<br/><b>埋樁時樁類</b>: ${data.Type}`;
        str += `<br/><b>坐標系統</b>: ${data.coorSys}`;
        str += `<br/><b>巡查結果</b>: ${data.Inspect}`;
        str += `<br/><b>坐標x</b>: ${data.x}`;
        str += `<br/><b>坐標y</b>: ${data.y}`;
        return str;
    }
}
