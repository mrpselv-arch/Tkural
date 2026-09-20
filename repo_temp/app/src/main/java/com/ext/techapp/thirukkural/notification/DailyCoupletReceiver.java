package com.ext.techapp.thirukkural.notification;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;

import com.ext.techapp.thirukkural.ItemDetailActivity;
import com.ext.techapp.thirukkural.R;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * Created by Selvam on 10/24/2015.
 */
public class DailyCoupletReceiver extends BroadcastReceiver {

    public static String NOTIFICATION_ID = "notification-id";
    public static String NOTIFICATION = "notification";
 int notifyId=0;
    @Override
    public void onReceive(Context context, Intent dailyIntent) {

        NotificationManager notificationManager = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
        ///Notification notification = intent.getParcelableExtra(NOTIFICATION);

        NotificationCompat.Builder mBuilder =
                new NotificationCompat.Builder(context)
                        .setSmallIcon(R.drawable.ic_stat_t)
                        .setContentTitle("இன்றைய குறள்");
        //.setContentText("Hello World!");

        final Intent detailIntent = new Intent(context.getApplicationContext(), NotificationDetailActivity.class);

        CoupletsXMLParser.Couplet couplet = getCouplet(context);
        detailIntent.putExtra("couplet_number", couplet.getCoupletNumber());
        detailIntent.putExtra("selected_couplet", couplet);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(context);
        stackBuilder.addParentStack(NotificationDetailActivity.class);
        stackBuilder.addNextIntent(detailIntent);

        PendingIntent resultPendingIntent =
                stackBuilder.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT);

        //final PendingIntent contentIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        mBuilder.setContentIntent(resultPendingIntent);

        mBuilder.setContentText(couplet.getFirstLineTamil() + "\n" + couplet.getSecondLineTamil());

        mBuilder.setAutoCancel(true);
        Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        mBuilder.setSound(alarmSound);


        Notification notification = mBuilder.build();

      //  int id = intent.getIntExtra(NOTIFICATION_ID, 0);
        notificationManager.notify(notifyId, notification);
        notifyId++;
    }

    private CoupletsXMLParser.Couplet getCouplet(Context context){
        int min = 1;
        int max = 133;


        int chapter_code = min + (int)(Math.random() * ((max - min) + 1));
//        r.nextInt(max - min + 1) + min;

        int id = context.getResources().getIdentifier("chapter_" + chapter_code, "raw", context.getPackageName());
        InputStream in = context.getResources().openRawResource(id);
        CoupletsXMLParser.Couplet couplet=null;
        try {
            Map<Integer, CoupletsXMLParser.Couplet> coupletsMap = new CoupletsXMLParser().coupletsList(in);
            CoupletsXMLParser.Couplet[] couplet_list_to_show = new CoupletsXMLParser.Couplet[10];
            int i = 0;
            for (Object key : coupletsMap.keySet()) {
                // int i = (int)key;
                CoupletsXMLParser.Couplet kural = coupletsMap.get(key);
                couplet_list_to_show[i] = kural;
                i++;
            }

            int kural = 0 + (int)(Math.random() * ((9 - 0) + 1));
            couplet=couplet_list_to_show[kural];
        } catch (XmlPullParserException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return couplet;
    }

}
